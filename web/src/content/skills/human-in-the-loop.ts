import type { SkillContent } from "../types";

const humanInTheLoop: SkillContent = {
  overview: `
Human-in-the-loop (HITL) AI is the discipline of building agent systems that explicitly ask humans to make or review key decisions, rather than going fully autonomous. It sits between "the AI decides everything" (expensive, unpredictable, risky) and "the human does everything" (doesn't scale). The core insight: deploy AI agents to do the routine, low-stakes majority of work quickly; reserve human judgment for the high-stakes, ambiguous, or contentious remainder.

For an AI engineer, HITL is not a special mode or optional add-on—it is a structural requirement of any production agent system that touches real-world consequences (legal contracts, financial decisions, content moderation, medical recommendations). A fully autonomous agent that confidently gets 95% of cases right will cause 10–100 business incidents per week at scale, each surfacing your system's brittleness in a customer-facing or court-discoverable way. HITL systems reduce that to the one hard case per week, which a human can actually think carefully about.

Key characteristics: explicit escalation points (if the agent's confidence is below a threshold, ask a human); structured approval gates (a human must click "approve" before the decision lands in production); asynchronous review queues (decisions don't block waiting for human feedback); audit trails (every human decision is logged and attributable); and feedback loops (human decisions on edge cases improve the model's future behavior via fine-tuning, retrieval, or prompt refinement).
`,

  history: `
HITL AI is not a novel concept—it emerged from user-facing information systems (search, recommendation, moderation) that needed to balance scale with accuracy. The patterns predate LLMs by decades; what LLMs changed was the feasibility of deploying intelligent agents at all, making HITL not an edge case but a primary operational requirement.

| Year | Milestone |
|------|-----------|
| 2000s–2010s | Content moderation at scale (Facebook, YouTube) discovers that pure automation fails on edge cases; human review queues become standard |
| 2010s | Recommendation systems (Netflix, Spotify) use collaborative filtering + human curation; fully automated recommendations feel stale |
| 2018 | Google Search Console and Ads introduce "human review" workflows for policy violations; automation + escalation becomes industry-standard |
| 2022–2023 | Early LLM applications (customer service, code review assistants) surface high-frequency failures (hallucinations, tool misuse) that require immediate human gatekeeping |
| 2023 | Anthropic's Constitutional AI and RLHF-from-human-feedback (RHEF) frameworks make human feedback a first-class input to model improvement, not just production safety |
| 2024 | HITL becomes explicit in agent frameworks: LangGraph integrates approval nodes, CrewAI has human escalation, AutoGen has explicit human-agent conversation patterns |
| 2024–2025 | Emerging best practice: spend engineering effort on HITL infrastructure (queues, UI, SLAs) rather than chasing perfect automation; 95% automated + excellent HITL often outperforms 99% automated + poor UX |

The shift: early HITL was "automate most, escalate edge cases." Modern HITL is "design the human workflow as the primary experience; automation is a fast-path throughput multiplier, not a replacement for judgment."
`,

  "why-it-exists": `
HITL exists because autonomous AI systems hit hard limits around three problems that don't have technical solutions:

1. **Ambiguity that only humans can resolve.** "Is this contract acceptable?" has a legal answer only after a human lawyer reads it in context. An agent can flag red flags (liability caps, termination clauses) but cannot make the yes/no call without reducing it to rules so narrow they're brittle. HITL doesn't add "intelligence"—it adds the authority to make a judgment call.

2. **Edge cases with long-tail costs.** An agent can handle 95% of support tickets correctly. The remaining 5% are complex, unusual, or contentious—but they concentrate 50%+ of repeat contacts, complaints, and escalations. Escalating those 5% to humans costs money per case but saves money overall (cheaper than churn, lawsuits, brand damage).

3. **Lack of recourse when the AI is wrong.** If an agent approves a loan, denies a benefit, or removes a post, a human had better be able to explain why and reverse it. Audit trails, explainability, and the ability to appeal all require a human on the hook. Insurance and regulation require it.

HITL doesn't solve "how do we make AI better"—it solves "how do we deploy AI safely while we're making it better."
`,

  "problem-it-solves": `
HITL removes or manages:

- **The binary choice between full autonomy and full human bottleneck.** Instead of "agents decide everything (risk) or humans decide everything (no scale)," escalate strategically by confidence, rule, or sampling.
- **Silent failures in production.** An agent deciding incorrectly is harder to catch than a human making a wrong decision and leaving a trace. HITL forces a decision to be explicit and logged.
- **Liability and audit trail gaps.** When things go wrong, "the agent did it" is not a defensible answer to a regulator or a court. HITL requires a person to be accountable.
- **Missed opportunities to improve.** Every human decision on a hard case is a training signal; HITL workflows that route human decisions back into model retraining create feedback loops that autonomous systems can't.
- **User distrust of black-box AI.** Users tolerate "the AI decided this, a human can override it" much more readily than "the AI decided this, goodbye." HITL is often better UX than pure automation.

What HITL does NOT solve: making AI correctly understand the domain in the first place (that's training, RAG, agent design); or removing human bias (humans bring their own biases). HITL is not a fix for a broken agent—it's a wrapper that makes a imperfect agent safe enough to deploy.
`,

  "learning-objectives": `
By the end of this page, you will be able to:

1. Design HITL workflows: identify escalation points, define thresholds, structure approval gates.
2. Build human review queues: implement priority, SLA tracking, assignment routing.
3. Integrate feedback loops: route human decisions back into the system (fine-tuning, retrieval, prompts).
4. Implement audit trails: log every decision, human and AI, with full attribution.
5. Handle asynchronous work: decouple agent decisions from human approval; design for eventual consistency.
6. Measure HITL effectiveness: cost per escalation, human accuracy, feedback loop impact, end-to-end latency.
7. Design user-facing HITL experiences: approval UX, appeal mechanisms, transparency.
8. Answer senior-level interview questions on balancing automation vs. control, feedback loops, and scaling HITL.
`,

  prerequisites: `
- **Required**: **Agent Fundamentals** (agents, decision-making, tool use) and **Multi-Agent Systems** (coordination, handoffs).
- **Required**: **Human-in-the-Loop AI Fundamentals** (understanding what HITL is conceptually)—covered in this page.
- **Helpful**: **Evaluation** (how to measure whether decisions are correct) and **Monitoring** (tracking HITL queue health).
- **Helpful**: **Product thinking** (HITL is as much product design as infrastructure).

Dependency links: **Agent Fundamentals** + **Multi-Agent Systems** → this page → **AI Observability** (tracing decisions), **Evaluation** (measuring HITL impact).
`,

  "beginner-concepts": `
### What is HITL?

Human-in-the-loop means:
1. An agent makes a decision or recommendation.
2. Under certain conditions (low confidence, high stakes, policy), it escalates to a human.
3. The human approves, rejects, or modifies the decision.
4. The result (AI decision + human override) is what lands in production.

Simple example:
~~~python
# A support agent handles a ticket
response = support_agent.handle(ticket)

# Check if escalation is needed
if response.confidence < 0.7 or response.category == "chargeback":
    # Escalate to human review queue
    await review_queue.add(response, priority="high")
    # Return "pending human review" to customer
    return "Thank you, a specialist will review this shortly"
else:
    # Low-risk; send response immediately
    return response.text
~~~

### Types of escalation

**Confidence threshold**: Escalate if the agent is not sure.
~~~python
if agent_score < 0.8:
    escalate()
~~~

**Policy rule**: Escalate high-stakes categories (financial, legal, health).
~~~python
if category in ["contract_approval", "loan_denial", "content_removal"]:
    escalate()
~~~

**Sampling**: Route a random fraction of decisions to humans, to catch systematic drift.
~~~python
if random.random() < 0.05:  # 5% sample
    escalate()
~~~

**User appeal**: Escalate if a user disputes the AI decision.
~~~python
if request.status == "appealed":
    escalate()
~~~

### The HITL workflow

~~~
AI makes decision
    ↓
Check escalation condition
    ├─ YES → Enqueue for human review
    │         Human reviews when capacity available
    │         Human approves/rejects/modifies
    │         Decision + feedback logged
    │         Feedback may improve model
    │
    └─ NO → Decision lands in production immediately
            (Maybe logged for monitoring/sampling)
~~~

### Asynchronous vs synchronous HITL

**Synchronous** (blocking): The user waits for human decision.
- Pro: User gets immediate clarity.
- Con: Scales poorly (human can only handle ~10–100 decisions/day if each takes 5–30 min).
- Use: High-stakes decisions where the user expects a delay (loan approval, contract negotiation).

**Asynchronous** (non-blocking): The AI returns a tentative decision; human reviews later.
- Pro: Scales (you can batch reviews; users don't block on human availability).
- Con: The human might override a decision the user already acted on (e.g., "transaction approved" then later "actually denied").
- Use: Routine decisions with low user downside (content moderation flagging, routine support replies).

Most production systems use async with a "review within 24 hours" SLA.

### Simple example: code review with HITL

~~~python
class CodeReviewAgent:
    async def review(self, pr):
        # AI agent reviews code
        issues = await self.find_issues(pr)

        # Escalate if many issues or high risk
        if len(issues) > 10 or any(i.severity == "critical" for i in issues):
            await self.review_queue.add(pr, issues)
            return "Escalated to senior review"

        # Low-risk: approve immediately
        return {
            "approved": True,
            "issues_found": issues,
            "confidence": 0.92,
        }

# Later, a human reviews escalated PRs
human_decision = await review_queue.next_awaiting_review()
# Human reads AI findings, adds their own notes, approves or rejects
human_decision.approve_or_reject()
# Feedback is logged for model improvement
~~~
`,

  "intermediate-concepts": `
### Designing escalation thresholds

Not all decisions should be escalated equally. Define a matrix:

~~~
| Category | Escalate if | Reason | SLA |
|----------|-----------|--------|-----|
| Support ticket (routine) | confidence < 0.6 | Avoid wrong answer | 24h |
| Product refund | amount > $500 | High financial impact | 4h |
| Legal interpretation | any | Legal liability | 2h |
| Content removal (user report) | any | Appeals risk | 2h |
| Content removal (system flag) | severity < 0.8 | Likely errors | 48h |

~~~

Too aggressive (escalate everything) defeats the purpose. Too lenient (never escalate) risks disasters. The goal: escalate the 5–20% of decisions where human judgment genuinely adds value.

### Feedback loops: Closing the improvement loop

A HITL system is only as good as its feedback. When a human overrides an AI decision, that's data—if you capture it.

~~~python
class FeedbackLoop:
    async def log_override(self, ai_decision, human_override):
        # Store the case: what the AI said, what the human said
        feedback = {
            "input": ai_decision.input,
            "ai_output": ai_decision.output,
            "ai_confidence": ai_decision.confidence,
            "human_override": human_override,
            "reason": human_override.reason,
            "timestamp": now(),
        }
        await self.feedback_store.add(feedback)

        # Later, use this feedback to improve the model
        # Option 1: Fine-tune the model on overridden cases
        if len(self.feedback_store) > 100:
            training_data = self.feedback_store.recent_overrides()
            await self.finetune_model(training_data)

        # Option 2: Improve the prompt based on patterns
        patterns = self.analyze_overrides()
        if patterns.hallucination_rate > 0.1:
            await self.update_prompt_with_clarification()

        # Option 3: Improve retrieval (RAG)
        if patterns.missing_context:
            await self.improve_retrieval_context()
~~~

The key: feedback is only valuable if it makes it back to the system. Many HITL deployments capture human decisions but never use them.

### Designing review queues

A review queue is where escalated decisions wait for human attention.

~~~python
class ReviewQueue:
    def __init__(self):
        self.queue = []  # In production: persistent store (DB)
        self.assignment_rules = {}  # Route items to experts by type

    async def add(self, item, priority="normal"):
        # Enqueue with metadata
        item.entered_at = now()
        item.priority = priority
        item.assigned_to = None
        self.queue.append(item)

    async def list_for_user(self, user_id):
        # Return items this user should review
        assigned = [i for i in self.queue if i.assigned_to == user_id]
        return sorted(assigned, key=lambda i: i.priority)

    async def claim(self, item_id, user_id):
        # Human claims an item (locks it so others don't work on it)
        item = self.queue[item_id]
        if item.assigned_to and item.assigned_to != user_id:
            raise AlreadyAssigned()
        item.assigned_to = user_id
        item.claimed_at = now()

    async def resolve(self, item_id, decision):
        # Human submits their decision
        item = self.queue[item_id]
        item.human_decision = decision
        item.resolved_at = now()
        item.sla_met = (now() - item.entered_at) < item.sla

        # Log for feedback
        await self.log_feedback(item)
        # Remove from queue
        self.queue.remove(item)

        # Alert downstream (update user, apply decision, etc.)
        await self.on_resolve(item)
~~~

### Audit trails

Every decision—AI and human—must be logged with full context.

~~~python
class AuditLog:
    async def log_ai_decision(self, decision):
        entry = {
            "timestamp": now(),
            "type": "ai_decision",
            "input": decision.input,
            "output": decision.output,
            "confidence": decision.confidence,
            "model": decision.model,
            "request_id": decision.request_id,
        }
        await self.store(entry)

    async def log_human_decision(self, human_decision):
        entry = {
            "timestamp": now(),
            "type": "human_decision",
            "request_id": human_decision.request_id,
            "human_id": human_decision.human_id,
            "decision": human_decision.decision,
            "reason": human_decision.reason,
            "override_of_ai": human_decision.ai_decision.output,
        }
        await self.store(entry)

    async def query(self, request_id):
        # Full history: AI said X at time T1, human said Y at time T2
        return await self.store.filter(request_id=request_id)
~~~

In production, audit logs are discoverable (legal requests, customer disputes, regulatory audits).
`,

  "advanced-concepts": `
### Efficient escalation: Batching and prioritization

At high volume (1000s of escalations/day), you can't review each one individually. Batch similar items and prioritize.

~~~python
class SmartEscalation:
    async def batch_similar_items(self):
        # Group escalated items by category
        by_category = groupby(self.queue, key=lambda i: i.category)

        # Batch: one expert reviews "refund > $500" cases together
        # vs. reviewing them one at a time
        for category, items in by_category.items():
            batch = {
                "category": category,
                "count": len(items),
                "items": items,
                "deadline": now() + timedelta(hours=4),
            }
            await self.assign_batch(batch)

    async def prioritize_queue(self):
        # High-priority items (financial, legal, user appeal) at the top
        # Low-priority items (routine sampling) at the bottom
        self.queue.sort(key=lambda i: (
            -i.priority_score(),  # Higher = more urgent
            i.entered_at,  # Older = more urgent (FIFO within priority)
        ))
~~~

With batching, a human can review 50 similar cases in 30 minutes, vs. 50 disjoint cases in 4 hours.

### Feedback at scale: Learning from overrides

As human decisions accumulate, patterns emerge. Use them to improve the agent.

~~~python
class LearnFromOverrides:
    async def analyze_patterns(self):
        overrides = await self.feedback_store.all_human_overrides()

        # Find categories where AI is frequently wrong
        by_category = groupby(overrides, key=lambda o: o.category)

        for category, cases in by_category.items():
            accuracy = 1 - (len(cases) / self.decisions_in_category[category])

            if accuracy < 0.85:
                # This category needs attention
                print(f"{category}: {accuracy*100:.1f}% AI accuracy")

                # Analyze the mistakes
                mistakes = [c for c in cases if c.ai_output != c.human_override]

                # Pattern 1: Missing context?
                if all_missing_context(mistakes):
                    print(f"  -> Missing context in retrieval, improve RAG")

                # Pattern 2: Hallucination?
                if all_hallucinated_facts(mistakes):
                    print(f"  -> Agent hallucinates facts, add guardrail")

                # Pattern 3: Ambiguity?
                if all_subjective(mistakes):
                    print(f"  -> Category is inherently ambiguous, escalate more")
~~~

The goal: use overrides to close feedback loops, not just record them.

### Handling feedback delay and contradiction

Real-world HITL has delays: an AI decision lands today, human feedback arrives tomorrow. And sometimes, two humans disagree.

~~~python
class DelayedFeedback:
    async def apply_feedback_with_delay(self, feedback):
        # Feedback on a decision that's already in production
        decision = await self.decisions_store.get(feedback.decision_id)

        if decision.already_acted_on:
            # The action already happened. We can't undo it.
            # Log it for reversal / customer service escalation
            await self.log_reversal_candidate(decision, feedback)
        else:
            # Action not yet taken. Veto the decision.
            decision.vetoed = True
            decision.veto_reason = feedback.reason

    async def handle_human_disagreement(self, decision_id):
        # Two reviewers disagreed
        decision = await self.decisions_store.get(decision_id)

        # Option 1: Require consensus (third human reviews)
        if decision.disagreement_count < 2:
            await self.route_to_tiebreaker()
        else:
            # Option 2: Log and escalate (this is a policy question, not a data question)
            await self.log_policy_decision(decision)
~~~

### Transparent HITL in user-facing systems

When a user gets "your request is pending human review," they deserve context.

~~~python
class UserFacingHITL:
    async def explain_escalation(self, request_id):
        # User-friendly explanation of why they're in the review queue
        request = await self.store.get(request_id)

        if request.reason == "high_stakes":
            return "Your request involves a significant financial decision. A specialist is reviewing it to ensure accuracy."
        elif request.reason == "policy_review":
            return "Your request requires policy review. This typically takes 24–48 hours."
        elif request.reason == "appeal":
            return "You've appealed a previous decision. Our team will re-examine it."

        return "Your request is being reviewed by our team. We'll follow up within 24 hours."

    async def provide_estimated_wait(self, request_id):
        queue = await self.review_queue.list_all()
        position = len([r for r in queue if r.priority >= request.priority])

        # Estimate: humans can review ~10 items/hour, depending on complexity
        items_ahead = position
        hours_to_wait = items_ahead / 10  # rough estimate

        return {
            "position_in_queue": position,
            "estimated_wait_hours": hours_to_wait,
            "sla_hours": request.sla,
        }

    async def support_appeal_workflow(self, request_id, reason):
        # User can appeal an AI decision
        original = await self.store.get(request_id)

        appeal = {
            "original_request_id": request_id,
            "appealed_by": current_user.id,
            "reason": reason,
            "created_at": now(),
            "priority": "high",  # Appeals get priority
        }

        await self.review_queue.add(appeal)
        return "Your appeal has been submitted. A specialist will review it within 4 hours."
~~~

### Measuring HITL effectiveness

~~~python
class HITLMetrics:
    async def measure_effectiveness(self):
        metrics = {}

        # Escalation rate: what % of decisions need human review?
        metrics["escalation_rate"] = (
            self.escalations_count / self.total_decisions
        )  # Target: 5–20% depending on domain

        # Human accuracy: how often is the human "right"? (measured by downstream)
        metrics["human_accuracy"] = (
            self.correct_human_decisions / self.reviewed_decisions
        )  # Target: > 95%

        # Feedback loop impact: do overrides improve model accuracy?
        before = self.ai_accuracy_before_feedback_applied
        after = self.ai_accuracy_after_feedback_applied
        metrics["accuracy_improvement"] = after - before  # Target: +2–5 percentage points per quarter

        # Latency: how long from escalation to human decision?
        metrics["median_review_time_hours"] = percentile(
            self.review_times, 0.5
        )  # Target: < 4h (async)
        metrics["p95_review_time_hours"] = percentile(
            self.review_times, 0.95
        )  # Target: < 24h

        # Cost: is HITL worth it?
        metrics["cost_per_escalation"] = (
            self.human_review_cost / self.escalations_count
        )
        metrics["business_impact"] = (
            self.prevented_errors * cost_per_error -
            self.false_escalations * escalation_cost
        )  # Net value

        return metrics
~~~
`,

  "internal-working": `
A HITL system executes like this:

~~~
1. [Agent] Processes input, generates decision + confidence
2. [Router] Checks: should this escalate?
   - If yes → go to 3
   - If no → go to 5
3. [Escalate] Enqueue to review queue (async, usually)
   Return "pending review" to user
4. [Human] Reviews item when it reaches top of queue
   Approves, rejects, or modifies decision
   Logs feedback
   Item marked as "resolved"
5. [Apply] Either the AI decision (if not escalated) or human decision lands in production
6. [Log] Full audit trail recorded
7. [Feedback] If human override occurred, use it to improve the model
~~~

### Mermaid diagram of HITL flow

~~~mermaid
sequenceDiagram
    participant User
    participant Agent
    participant Router
    participant Queue
    participant Human
    participant Store

    User->>Agent: Submit request
    Agent->>Agent: Generate decision + confidence
    Agent->>Router: Check escalation condition

    alt Escalate needed
        Router->>Queue: Enqueue for review
        Queue-->>User: Return "pending human review"
        Note over Queue: Item waits in queue
        Human->>Queue: Claim item when ready
        Human->>Human: Review decision + reasoning
        Human->>Queue: Submit approval/rejection
        Queue->>Store: Log human decision + feedback
        Store-->>User: Notify final decision
    else No escalation needed
        Router->>Store: Log AI decision
        Store-->>User: Return AI decision immediately
    end

    Note over Store: Feedback loop: overrides → model improvement
~~~

The key: decision and human review can happen asynchronously. User doesn't block on human availability.
`,

  architecture: `
### Reference HITL architecture

~~~mermaid
graph TB
    Client["Client / User"] -->|request| API["API Gateway"]

    API -->|async| Agent["Agent"]

    Agent -->|decision + confidence| Router["Escalation Router<br/>Checks confidence / policy / sampling"]

    Router -->|escalate| Queue["Review Queue<br/>Priority-based, SLA-tracked"]
    Router -->|approve immediately| ProductionDB["Production DB<br/>Decision applied"]

    Queue -->|notify| Dashboard["Human Review Dashboard<br/>List assigned items"]

    Dashboard -->|human reviews + decides| HumanStore["Human Decision Store<br/>Audit trail"]

    HumanStore -->|finalize decision| ProductionDB

    HumanStore -->|feedback signal| FeedbackLoop["Feedback Loop<br/>Analyze overrides"]

    FeedbackLoop -->|fine-tuning data| ModelImprovement["Model Improvement<br/>Retrain / prompt / RAG"]

    ModelImprovement -->|updated model| Agent

    Agent & HumanStore -->|metrics/traces| Observability["Observability<br/>Prometheus + Jaeger"]

    AuditLog["Audit Log<br/>Every decision logged<br/>with full context"] -.->|immutable record| ProductionDB
    AuditLog -.-> HumanStore

    subgraph "AI Layer"
        Agent
    end

    subgraph "Decision Routing"
        Router
    end

    subgraph "Human Review"
        Queue
        Dashboard
    end

    subgraph "Storage & Learning"
        ProductionDB
        HumanStore
        FeedbackLoop
        ModelImprovement
    end
~~~

Each layer is independent:
- Agent can be swapped (different models, frameworks).
- Router logic is pure rules (easy to update).
- Queue and Dashboard are decoupled (async).
- Feedback loop can use different improvement strategies.
`,

  "data-flow": `
End-to-end trace: a user requests a refund > $500.

~~~
1. [Client] POST /refunds
   Body: { amount: 750, reason: "item defective" }

2. [API] Auth + validation, route to agent

3. [Agent] Analyze refund request
   - Check account history, item, reason
   - Generate decision: "approve with condition: ask for photo proof"
   - Confidence: 0.65 (lower than normal; item is niche category)

4. [Router] Decision analysis
   - Escalation rule: amount > $500 → ESCALATE
   - Additional rule: confidence < 0.75 → ESCALATE
   - Both triggered; escalate immediately

5. [Enqueue] Create review item
   {
     "request_id": "req_123",
     "user_id": "user_456",
     "category": "refund_large_amount",
     "amount": 750,
     "ai_decision": "approve_with_condition",
     "ai_confidence": 0.65,
     "ai_reasoning": "account clean, item legit, reason plausible",
     "escalation_reason": ["policy_rule_large_amount", "low_confidence"],
     "entered_at": "2025-07-28T10:15:00Z",
     "sla": "4_hours",
   }

6. [Queue] Item waits for human
   (Other items ahead in priority order)

7. [Human] Reviews item
   Human dashboard shows:
   - Item details (account, item, reason)
   - AI reasoning
   - Suggested decision

   Human decision: "Approve full refund + ask for feedback"
   Reason: "Account has clean history; genuine defect claim"

8. [Resolve] Human submits decision
   {
     "request_id": "req_123",
     "human_id": "human_789",
     "decision": "approve_full",
     "reason": "account_clean_genuine_claim",
     "timestamp": "2025-07-28T10:32:00Z",
     "sla_met": true,  # Resolved in 17 min < 4 hour SLA
   }

9. [Apply] Final decision to production
   - Mark refund as approved in payment system
   - Notify user: "Your refund of $750 has been approved"
   - Log transaction

10. [Feedback] Store override
    - AI said: approve_with_condition
    - Human said: approve_full
    - Why: account_clean_genuine_claim

    This is a training signal: in similar cases, approve unconditionally if account is clean

11. [Improvement] Periodically, analyze overrides
    - "Large refunds": human overrides AI in 30% of cases
    - Pattern: humans approve more often than AI expects when account is clean
    - Action: retrain model with override data or adjust prompt to weight account history more
`,

  "production-usage": `
### Typical HITL deployment

~~~yaml
escalation:
  rules:
    - category: refund
      condition: amount > 1000
      priority: high
      sla_hours: 2

    - category: content_removal
      condition: any
      priority: medium
      sla_hours: 24

    - category: fraud_alert
      condition: confidence < 0.8
      priority: critical
      sla_hours: 0.5

    - category: routine_support
      condition: confidence < 0.6
      priority: low
      sla_hours: 48

    - category: sampling
      condition: random() < 0.05  # 5% sample all decisions
      priority: low
      sla_hours: 72

review_queue:
  backend: postgresql  # persistent storage
  cache: redis        # for performance
  max_queue_depth: 10000

human_dashboard:
  ui: web app (React)
  features:
    - filter by category, priority, age
    - claim / release items
    - inline decision UI
    - appeal / reopen workflow

audit_log:
  backend: immutable append-only log (PostgreSQL or S3)
  retention: 7 years (legal requirement)

feedback:
  collection: all overrides logged automatically
  analysis: daily report on override patterns
  model_improvement:
    - fine-tuning: weekly on high-volume categories
    - prompt_refinement: as patterns emerge
    - rag_improvement: if missing context detected

observability:
  metrics:
    - escalation_rate per category
    - review_latency (median, p95, p99)
    - human_accuracy (inferred from downstream events)
    - feedback_loop_impact
  dashboards:
    - HITL operational dashboard
    - Model improvement tracking
    - SLA compliance
~~~

### Configuration for different domains

**Financial (high-stakes)**:
- Escalate: high-value transactions ($1000+), policy changes, fraud flags.
- SLA: 2–4 hours (humans available during business hours).
- Human accuracy target: > 99%.
- Feedback: fine-tuning on overrides weekly.

**Content moderation (high-volume)**:
- Escalate: all policy violat ions (AI makes flag/no-flag call), appeals.
- SLA: 24–72 hours (review can be async).
- Human accuracy target: > 95%.
- Feedback: prompt refinement based on patterns.

**Customer support (routine)**:
- Escalate: low confidence, policy-required categories, customer escalation.
- SLA: 24 hours.
- Human accuracy target: > 90%.
- Feedback: model retraining on support team feedback monthly.
`,

  "industry-examples": `
### 1. Stripe's fraud detection

Stripe uses a multi-layer HITL system:
- **Tier 1**: Automated rules (velocity, known-bad cards) → block immediately.
- **Tier 2**: ML model with confidence scoring → if confidence < 0.75, human review.
- **Tier 3**: Human reviewers check flagged transactions.
- **Feedback**: Reviewers' decisions feed back into model retraining.

Result: Fraud caught at scale without over-blocking legitimate transactions. Feedback loop reduces false positives by ~2% per quarter.

### 2. OpenAI's content moderation

OpenAI uses HITL for policy violations:
- **Agent**: Classifies content against policies (sexual, violence, misinformation).
- **Escalation**: Borderline cases (confidence 0.5–0.8) routed to humans.
- **Human review**: Trained reviewers make final policy judgment.
- **Feedback**: Reviewer decisions improve model prompt and training data.

### 3. LinkedIn's hiring assistant

LinkedIn's job recommendation system has an approval gate:
- **Agent**: Ranks candidate matches to open roles.
- **Escalation**: If model confidence is low or match involves protected attributes, escalate.
- **Human review**: Recruiter confirms before reaching out to candidate.
- **Feedback**: Recruiter feedback on whether candidate was interested improves ranking.

### 4. Anthropic's Constitutional AI

Anthropic's approach to HITL feedback:
- **Agent**: Model generates response.
- **Evaluation**: Against constitutional principles (harm, honesty, helpfulness).
- **Escalation**: If evaluation detects potential violation, escalate to humans.
- **Feedback**: Human judgments are used to fine-tune via RLHF.

Key insight: HITL is not just operational (review queue); it's also foundational (training data).

### 5. Healthcare: diagnostic assistance

A diagnostic AI assistant in a hospital:
- **Agent**: Analyzes patient imaging, suggests diagnosis.
- **Escalation**: All recommendations go to radiologist for approval (100% HITL).
- **Feedback**: Radiologist notes guide model improvement.
- **Audit**: Every diagnosis path is legally discoverable.

This is the opposite of "minimize HITL for speed"—HITL is structural for liability.
`,

  "best-practices": `
1. **Define clear escalation criteria ahead of time.** "We'll escalate if we're not sure" is too vague. Specify: confidence < 0.8, category == "legal", amount > $5000, or user appeal.

2. **Set SLAs and monitor them.** If humans can't review items within the SLA, your HITL is broken. A 24-hour SLA is typical for async review; 4-hour for urgent (financial).

3. **Make human review easy, not slow.** A 30-second decision UI for a well-structured item beats a 10-minute deep-dive. Pre-format data, highlight key facts, suggest a decision.

4. **Close feedback loops intentionally.** Capturing overrides is step 1. Using them to improve the model is step 2. Many teams do step 1 and forget step 2.

5. **Measure human accuracy, not just AI accuracy.** If you can't measure whether humans are making correct decisions, you can't validate your HITL.

6. **Use asynchronous review by default.** Block users only when truly necessary (financial decisions where they're waiting for a yes/no). For most cases, "pending review" → callback is better UX.

7. **Over-communicate with users.** Explain why they're in review ("Your request involves a significant financial decision"), give them an estimate ("12–24 hours"), and provide an appeal path.

8. **Audit everything.** Every human decision must be logged with timestamp, human ID, reason, and the AI decision it overrode (if any). Treat audit logs as discoverable.

9. **Don't use HITL to patch a broken agent.** If you're escalating 50% of cases because the agent is bad, fix the agent. HITL is for edge cases, not crutches.

10. **Involve humans in design, not just review.** Early-stage humans should inform how decisions are framed (prompts, context, suggested options). Late-stage humans just rubber-stamp.

11. **Rotate reviewers and measure agreement.** If two different humans agree 85% of the time, you have a subjective category that needs clarification or more training data.

12. **Plan for scale from day one.** A queue that works with 100 items/day breaks at 1000 items/day. Design with batching, routing, and priority in mind.
`,

  "anti-patterns": `
### Anti-pattern 1: HITL as a band-aid for a bad model

❌ **Bad**: Agent is 60% accurate; escalate 40% to humans and claim "HITL solves it."

Why: Humans burn out reviewing bad outputs. HITL is expensive at scale (humans cost money and time).

✅ **Good**: Model is 90% accurate; escalate 10% where confidence is low. Humans review edge cases, not the agent's core failures.

### Anti-pattern 2: Humans review without feedback loop

❌ **Bad**: Humans approve/reject decisions in a queue, but those decisions never improve the model.

Why: You're not learning from feedback; next month, the same edge cases appear.

✅ **Good**: Overrides → stored in feedback DB → analyzed for patterns → used to retrain, prompt-refine, or improve retrieval.

### Anti-pattern 3: Blocking users on human review

❌ **Bad**: User submits request, waits for human decision before getting a response.

Why: Doesn't scale. Humans can't keep up; users experience long latencies.

✅ **Good**: Return "pending review" immediately; notify user when decided (async).

### Anti-pattern 4: No SLA on human review

❌ **Bad**: Items enter review queue and might sit there indefinitely.

Why: No accountability; urgent items get lost behind low-priority ones.

✅ **Good**: Define SLA (2 hours for critical, 24 hours for routine). Monitor compliance. Alert if backlog grows.

### Anti-pattern 5: Escalating without a decision path

❌ **Bad**: Route to a review queue but humans don't have time/training to review.

Why: Escalations pile up, nobody reviews them, deadline passes.

✅ **Good**: Ensure humans exist with capacity, training, and authority before you escalate.

### Anti-pattern 6: Hidden HITL (users don't know)

❌ **Bad**: User gets a decision; they don't know if it came from AI or human.

Why: No trust. If it's wrong, user doesn't know who to blame or appeal to.

✅ **Good**: Transparent. "This decision was reviewed by our team and approved" or "This is an AI-recommended decision subject to appeal."

### Anti-pattern 7: Audit log that's not actually immutable

❌ **Bad**: Store audit logs in a regular database. A human deletes a log entry to hide a mistake.

Why: No legal protection; no discovery trail.

✅ **Good**: Append-only log (immutable). Use S3 with versioning, or a purpose-built audit log service.
`,

  performance: `
### Measurement tools

1. **Escalation rate**: What % of decisions escalate?
   ~~~python
   escalation_rate = escalations_count / total_decisions
   # Healthy: 5–20% depending on domain
   ~~~

2. **Review latency**: How long does a human take to decide?
   ~~~python
   review_times = [item.resolved_at - item.entered_at for item in resolved]
   median = percentile(review_times, 0.5)
   p95 = percentile(review_times, 0.95)
   # Healthy: < 4 hours median, < 24 hours p95 (async)
   ~~~

3. **Human accuracy**: How often is the human "right"? (inferred from downstream outcomes)
   ~~~python
   correct = count(decisions where downstream_outcome == human_decision)
   accuracy = correct / total_reviewed
   # Target: > 90%
   ~~~

4. **Feedback loop impact**: Do overrides improve model accuracy?
   ~~~python
   accuracy_before = measure_ai_accuracy(before_feedback)
   accuracy_after = measure_ai_accuracy(after_feedback)
   improvement = accuracy_after - accuracy_before
   # Target: +2–5 percentage points per quarter
   ~~~

5. **SLA compliance**: Do humans decide within the SLA?
   ~~~python
   met = count(items where resolved_time < sla)
   compliance = met / total_reviewed
   # Target: > 95%
   ~~~

### Optimization hierarchy

1. **Reduce escalation rate by improving the model.** If you're escalating 30%, improve the agent. Escalation should be 5–15%, not 50%.

2. **Batch similar items.** One human reviews 50 similar refunds in 1 hour vs. 50 disjoint items in 5 hours.

3. **Automate routine decisions within the queue.** If 80% of reviews follow an obvious rule (e.g., "approve if account is clean"), code that rule instead of asking a human.

4. **Delegate to the right humans.** Route legal questions to lawyers, financial decisions to financial specialists. Specialist review is faster and more accurate.

5. **Improve the decision UI.** Make it easy for humans to see what the agent saw, what the agent decided, and what the suggested decision is.

6. **Cache human decisions.** If humans often approve the same category of request, cache and auto-approve similar requests.

### Cost model

~~~
Cost = (escalations_count * cost_per_review_hour * review_time_hours) +
       (appeals_count * cost_per_appeal)

For 10,000 decisions/month, 10% escalation:
  - 1,000 escalations
  - At $50/hour (human labor), 1 hour per review = $50k/month
  - At 0.5 hours per review = $25k/month
  - At 0.25 hours per review (batching, UI optimization) = $12.5k/month

HITL is expensive. The goal: minimize escalation rate (improve model) and reduce review time (better UI, batching, automation).
~~~
`,

  scalability: `
### Vertical vs. horizontal scaling of HITL

**Vertical scaling**: Make each human more efficient.
- Techniques: Better UI (summarize AI reasoning), batching (review 10 similar items together), automation (code obvious rules).
- Limits: A human can only do so much in 8 hours; attention fatigue limits review quality.
- When to use: Prototype / low-volume (< 1000 escalations/day).

**Horizontal scaling**: Hire more reviewers.
- Techniques: Divide by category (one team for refunds, one for appeals), divide by region (timezone coverage), use contractors.
- Limits: Training overhead, quality variance, cost.
- When to use: Production, high-volume (> 1000 escalations/day).

### Scaling table

| Scale | Escalations/day | Reviewers | Approach | Tools |
|---|---|---|---|---|
| Prototype | < 100 | 1–2 | Batching, simple rules | Spreadsheet + email |
| Small startup | 100–1000 | 2–5 | Categorized routing, SLA tracking | Custom dashboard + DB |
| Scaling startup | 1000–5000 | 5–20 | Team-based division, appeals process | Custom dashboard + workflow |
| Enterprise | 5000+ | 20–100 | Regional teams, specialist routing, appeals board | Vendor HITL platform (e.g., Labelbox) |

### Bottlenecks

**Human availability**: Reviewers are the bottleneck. At volume, you need: training pipeline (new reviewers), shift coverage (timezones), and appeals process (double-check close calls).

**UI latency**: If the dashboard is slow, humans review slowly. Optimize: preload summaries, cache AI reasoning, avoid real-time DB queries.

**Queue depth**: If queue grows faster than humans can process, add more humans or reduce escalation rate.

**Quality vs. speed**: As volume grows, humans rush, accuracy drops. Add: QA sampling (spot-check 5% of decisions), pair review (on close calls), or slow down (longer SLA).

### Cost scaling

As volume grows, cost per review should decrease (due to batching, automation, efficiency), not increase.

~~~
Healthy scaling:
- 1000 escalations/month @ $50 each = $50k
- 10000 escalations/month @ $25 each = $250k  (better batching, less overhead)
- 100000 escalations/month @ $5 each = $500k  (high automation, specialized teams)

Unhealthy scaling:
- 1000 escalations/month @ $50 each
- 10000 escalations/month @ $55 each  (no efficiency gains, more humans needed)
- 100000 escalations/month @ $60 each  (breaking down from complexity)
~~~

Fix unhealthy scaling: improve batching, reduce escalation rate, automate more decisions.
`,

  security: `
### Access control on HITL decisions

Who gets to review? Who gets to override?

~~~python
class HITLAccessControl:
    def check_permission(self, human_id, item_category):
        # Only lawyers can review legal items
        if item_category == "legal" and not has_role(human_id, "lawyer"):
            raise PermissionDenied()

        # Only financial specialists can review large transfers
        if item.amount > 10000 and not has_role(human_id, "financial_specialist"):
            raise PermissionDenied()

        # New reviewers are supervised for their first 100 items
        if human_id.review_count < 100:
            item.requires_supervisor_check = True

        return True
~~~

### Audit trail immutability

Once a human decision is logged, it must not be modifiable.

~~~python
class ImmutableAuditLog:
    async def record_decision(self, decision):
        # Write-once: no update, no delete allowed
        log_entry = {
            "id": uuid4(),
            "timestamp": now(),
            "decision": decision,
            "hash_of_prev_entry": self.last_hash,  # Chain like blockchain
        }
        await self.append_only_store.write(log_entry)
        self.last_hash = hash(log_entry)  # For chain integrity

    async def query(self, request_id):
        # Read all entries for this request
        return await self.append_only_store.filter(request_id=request_id)

    async def verify_integrity(self):
        # Check that the chain hasn't been tampered with
        entries = await self.append_only_store.all()
        for i in range(1, len(entries)):
            expected_hash = hash(entries[i-1])
            actual_hash = entries[i].hash_of_prev_entry
            if expected_hash != actual_hash:
                raise IntegrityError("Audit log has been modified")
~~~

### Sensitive data in reviews

If a human reviews a decision involving PII (customer SSN, medical data), that human can now see that data.

~~~python
class SensitiveDataHandling:
    async def prepare_review_item(self, item):
        # Redact PII from the human's view if possible
        if item.contains_ssn:
            item.ssn = "XXX-XX-" + item.ssn[-4:]  # Mask
        if item.contains_medical_data:
            item.medical_data = "[REDACTED]"  # Don't show

        # But log the original in audit trail (for legal disputes)
        await self.audit_log.record_unredacted(item)

        # Track: which human saw which PII?
        await self.access_log.record({
            "human_id": current_human.id,
            "saw_pii_type": ["ssn", "medical"],
            "timestamp": now(),
        })

        return item
~~~

### Guarding against reviewer bias and collusion

In some cases, humans have incentives to rubber-stamp decisions (bribery, favoritism).

~~~python
class BiasGuards:
    async def detect_suspicious_pattern(self):
        # Reviewer always approves? Unusual.
        for human_id in self.human_ids:
            approval_rate = count_approvals(human_id) / count_reviews(human_id)
            if approval_rate > 0.95 or approval_rate < 0.05:
                await self.alert_manager(f"Unusual approval rate for {human_id}: {approval_rate}")

        # Reviewer makes the exact same decision as AI in 100% of cases? Suspicious.
        for human_id in self.human_ids:
            agreement_with_ai = count_agreed_with_ai(human_id) / count_reviews(human_id)
            if agreement_with_ai > 0.99:
                await self.alert_manager(f"Human {human_id} agrees with AI in 100% of cases")

        # Reviewer always favors a specific customer? Potential bias.
        by_customer = group_by_customer(self.decisions)
        for customer_id, decisions in by_customer.items():
            approval_rate = count_approvals(decisions) / len(decisions)
            if len(decisions) > 10 and approval_rate > 0.9:
                await self.investigate_possible_bias(customer_id)
~~~

### Defending against prompt injection via HITL

If a user can influence what a human reviews, they can try to inject misleading context.

~~~python
# Bad: Concatenate user input directly
summary = f"Customer says: {user_input}"

# Good: Validate and structure first
class ReviewItem(BaseModel):
    user_reason: str = Field(..., max_length=500)
    category: str = Field(..., regex="^[a-z_]+$")

validated = ReviewItem(**request.dict())
summary = f"Customer says (in {validated.category} category): {validated.user_reason}"
~~~
`,

  testing: `
### Unit tests: escalation logic

~~~python
def test_escalation_rule_high_amount():
    decision = make_decision(amount=5000)
    assert should_escalate(decision) == True  # amount > $1000

def test_escalation_rule_low_confidence():
    decision = make_decision(confidence=0.6)
    assert should_escalate(decision) == True  # confidence < 0.75

def test_no_escalation_for_low_amount_high_confidence():
    decision = make_decision(amount=100, confidence=0.95)
    assert should_escalate(decision) == False
~~~

### Integration tests: end-to-end HITL

~~~python
@pytest.mark.asyncio
async def test_request_escalates_and_human_resolves():
    # 1. Escalate
    item = await escalate(request, reason="high_amount")
    assert item.status == "waiting_for_review"

    # 2. Human claims and decides
    await human_queue.claim(item.id, human_id="human_1")
    await human_queue.resolve(item.id, decision="approve")

    # 3. Verify decision landed in production
    result = await get_decision(request.id)
    assert result.approved == True
    assert result.resolved_by == "human_1"

    # 4. Verify audit log recorded it
    audit = await audit_log.query(request.id)
    assert len(audit) == 2  # AI decision + human override
~~~

### Load tests: queue performance

~~~python
@pytest.mark.asyncio
async def test_queue_handles_10k_items():
    items = [create_test_item() for _ in range(10000)]
    await queue.add_many(items)

    # List performance
    start = time.time()
    result = await queue.list_for_user("human_1")
    elapsed = time.time() - start

    assert elapsed < 0.5  # Must be sub-second
    assert len(result) < 100  # List paginated
~~~

### Quality metrics

~~~python
async def measure_hitl_quality():
    # Measure human accuracy (by downstream outcomes)
    correct = 0
    for decision in resolved_decisions:
        if decision_matches_user_satisfaction(decision):
            correct += 1
    human_accuracy = correct / len(resolved_decisions)

    # Measure agreement between humans
    same_case_reviewed_by_two_humans = [...]
    agreement_rate = count_agree(same_case_reviewed_by_two_humans) / len(...)

    # Measure override impact
    before = measure_ai_accuracy_before_feedback()
    after = measure_ai_accuracy_after_feedback()
    improvement = after - before

    return {
        "human_accuracy": human_accuracy,
        "inter_rater_agreement": agreement_rate,
        "model_improvement_from_feedback": improvement,
    }
~~~
`,

  debugging: `
### 1. Trace a request through HITL

~~~python
request_id = "req_12345"

# Find AI decision
ai_decision = await decisions_store.get(request_id)
print(f"AI: {ai_decision.output}, confidence={ai_decision.confidence}")

# Find escalation decision
escalation = await escalations_store.get(request_id)
print(f"Escalated: {escalation.reason}")

# Find human decision
human_decision = await review_queue.get(request_id)
print(f"Human: {human_decision.decision} (reviewed by {human_decision.human_id})")

# Audit trail
audit = await audit_log.query(request_id)
for entry in audit:
    print(f"  {entry.timestamp}: {entry.type} - {entry.decision}")
~~~

### 2. Check queue health

~~~python
queue_status = await review_queue.status()
print(f"Queue depth: {queue_status.total_items}")
print(f"Age of oldest: {queue_status.oldest_age}")
print(f"By category:")
for cat, count in queue_status.by_category.items():
    print(f"  {cat}: {count}")

if queue_status.oldest_age > queue_status.max_sla:
    alert("Queue SLA violated")
~~~

### 3. Measure human consistency

~~~python
# Cases reviewed by multiple humans
multi_reviewed = await decisions_store.find_reviewed_by_multiple()

for case in multi_reviewed:
    decisions = case.human_decisions
    if not all(d == decisions[0] for d in decisions):
        print(f"{case.id}: Disagreement")
        for human, decision in decisions:
            print(f"  {human}: {decision}")

agreement_rate = 1 - (disagreements / len(multi_reviewed))
print(f"Agreement rate: {agreement_rate * 100:.1f}%")
~~~

### 4. Common failure modes

| Symptom | Cause | Fix |
|---|---|---|
| Queue grows unboundedly | Humans can't keep up; escalation rate too high | Reduce escalation rate (improve model) or hire more humans |
| SLA violations | Items sitting in queue too long | Route high-priority items to dedicated fast-track |
| Human overrides always AI | Humans rubber-stamp | Audit quality; add second-reviewer for 5% sample |
| Feedback loop not improving model | Overrides logged but not used | Set up weekly job to analyze overrides and retrain |
| Humans disagree on same case | Ambiguous category or inadequate training | Clarify rules, retrain humans, or escalate more |
`,

  monitoring: `
### What to measure

1. **Escalation rate**: % of decisions that escalate.
   ~~~python
   gauge("escalation_rate", value=escalations / total_decisions, tags={"category": "refund"})
   # Target: 5–20%
   ~~~

2. **Queue depth**: How many items are waiting?
   ~~~python
   gauge("queue_depth", value=len(queue), tags={"priority": "high"})
   # Alert if > 1000 or growing steadily
   ~~~

3. **Review latency**: How long from escalation to human decision?
   ~~~python
   histogram("review_latency_minutes", value=latency, tags={"category": "refund"})
   # Target: median < 120 min, p95 < 1440 min (24h)
   ~~~

4. **SLA compliance**: % of items resolved within SLA.
   ~~~python
   gauge("sla_compliance_pct", value=(met / total) * 100, tags={"priority": "high"})
   # Target: > 95%
   ~~~

5. **Human accuracy**: % of decisions that were "correct" (inferred downstream).
   ~~~python
   gauge("human_accuracy_pct", value=accuracy * 100, tags={"reviewer": "human_123"})
   # Target: > 90%
   ~~~

6. **Model improvement from feedback**: Did overrides improve model?
   ~~~python
   gauge("model_accuracy_improvement_pct", value=improvement * 100)
   # Target: +2–5 points per quarter
   ~~~

7. **Cost per review**: Human time / outcome.
   ~~~python
   gauge("cost_per_review_usd", value=cost, tags={"category": "refund"})
   # Optimize: reduce through batching, automation
   ~~~

### Alerting rules

- **Alert if escalation_rate > 25%**: Model is degrading; too many items escalating.
- **Alert if queue_depth > 50% of daily capacity**: Backlog accumulating.
- **Alert if p95_review_latency > 2x SLA**: Humans can't keep up.
- **Alert if human_accuracy < 85%**: Reviewers making mistakes; training issue.
- **Alert if a reviewer has 0% disagreement with AI**: Rubber-stamping.

### Dashboard layout

~~~
[Escalation Rate]            [Queue Depth]
refund: 12%                  high priority: 45
appeal: 8%                   medium: 120
sampling: 5%                 low: 800

[Review Latency]             [SLA Compliance]
median: 95 min               high priority: 98%
p95: 850 min                 medium: 94%
p99: 1440 min                low: 87%

[Human Accuracy]             [Model Improvement]
human_123: 92%               baseline: 85%
human_456: 89%               after feedback: 88% (+3%)
Agreement: 87%
~~~

Refresh: every 5 minutes.
`,

  deployment: `
### Kubernetes deployment for HITL

~~~yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: human-review-queue
spec:
  replicas: 2
  selector:
    matchLabels:
      app: hitl-queue

  template:
    metadata:
      labels:
        app: hitl-queue
    spec:
      containers:
      - name: queue-api
        image: myregistry/hitl-queue:v1.2
        ports:
        - containerPort: 8000

        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"

        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: hitl-secrets
              key: database_url

        - name: QUEUE_MAX_SIZE
          valueFrom:
            configMapKeyRef:
              name: hitl-config
              key: queue_max_size

        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 10

        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: hitl-queue
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 8000
  selector:
    app: hitl-queue

---
apiVersion: batch/v1
kind: CronJob
metadata:
  name: hitl-feedback-processor
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: processor
            image: myregistry/hitl-feedback:v1.2
            command:
            - python
            - /app/analyze_overrides.py
          restartPolicy: OnFailure
~~~

### Configuration

~~~yaml
# hitl-config.yaml
escalation_rules:
  refund:
    amount_threshold: 1000
    priority: high
    sla_hours: 2

  appeal:
    condition: user_appeal == true
    priority: high
    sla_hours: 4

  content_removal:
    condition: policy_violation
    priority: medium
    sla_hours: 24

queue:
  max_size: 10000
  batch_size: 50  # Batch reviews
  alert_threshold: 5000

humans:
  max_concurrent_reviews: 5 per human
  shift_coverage: ["america", "europe", "asia"]

feedback:
  enabled: true
  store: postgresql
  analysis: daily
  retraining: weekly
~~~
`,

  "production-checklist": `
- [ ] Escalation rules are defined and documented (confidence threshold, category, amount, sampling %).
- [ ] Review queue is implemented (persistent store, priority, SLA tracking).
- [ ] Human dashboard is ready (list items, claim, resolve, UI for decision).
- [ ] Audit logs record every decision (AI and human, timestamp, reason, attribution).
- [ ] Feedback loop is set up (overrides stored, analyzed, used to improve model).
- [ ] SLA monitoring is active; alerts configured for violations.
- [ ] Human accuracy is measurable (inferred from downstream outcomes or direct feedback).
- [ ] Appeals process exists (user can appeal, human re-reviews).
- [ ] Humans are trained and available (shift coverage, process documentation).
- [ ] Data redaction is in place (PII not shown to humans unless necessary).
- [ ] Access control limits who can review what (lawyers for legal, financial specialist for transfers, etc.).
- [ ] Cost per review is tracked; escalation rate and review time are optimized.
- [ ] Asynchronous workflow is confirmed (users don't block on human decision).
- [ ] Integration tests pass; HITL flow works end-to-end.
- [ ] Load tests confirm queue can handle peak volume without degradation.
`,

  "common-mistakes": `
1. **No feedback loop.** Humans approve/reject decisions, but those decisions don't improve the model. Overrides are logs, not learning signals.

2. **Escalating because the AI is bad, not because the case is hard.** If 50% of cases escalate, fix the AI, not the HITL.

3. **Humans can't keep up with escalations.** Queue grows unboundedly; humans review items 1 week after they arrived, SLA violated.

4. **No SLA on human decisions.** Items sit in queue indefinitely. Customers never hear back.

5. **Blocking users on human review.** User submits request, waits 4 hours for human decision before getting a response. Doesn't scale.

6. **Not measuring human accuracy.** You don't know if humans are even making correct decisions.

7. **Audit logs that aren't truly immutable.** A human or system can delete or modify a log entry, destroying legal defensibility.

8. **HITL UI is too slow or complex.** Humans spend 30 minutes per review because UI is clunky. Cost explodes.

9. **No appeals process.** User's request is escalated, human approves, but user can't challenge the decision.

10. **Humans making decisions without clear context.** "Approve or reject" without showing the AI's reasoning or the user's request details.
`,

  "common-errors": `
| Error | Typical Cause | Fix |
|---|---|---|
| Queue grows unboundedly | Escalation rate too high; humans can't keep up | Reduce escalation rate (improve model) or add humans |
| SLA violations | Items waiting > SLA hours | Prioritize high-SLA items; route to fast-track queue |
| Humans disagree on same case | Ambiguous category or inconsistent training | Clarify rules, add example cases, retrain |
| Feedback loop doesn't improve model | Overrides logged but not analyzed/used | Set up weekly feedback analysis and retraining job |
| Human accuracy is low (< 85%) | Insufficient training or complex category | Retrain humans, simplify category, or escalate more |
| Users get no response after escalation | Async HITL, but no callback mechanism | Implement notification system (email/SMS when resolved) |
| Cost of HITL is exploding | Escalation rate too high or review time too long | Reduce escalations (improve model) or batch reviews |
| Same decision request reaches HITL twice | No deduplication before escalation | Check for duplicates; de-dup before enqueuing |
`,

  faqs: `
**Q: How often should humans review decisions?**

A: Depends on domain. Financial: 1–4 hours (sync). Content: 24–72 hours (async). Support: 24 hours. The key: define SLA based on cost of delay vs. cost of escalation.

**Q: Can we use HITL as a training data source for the model?**

A: Yes, absolutely. Every human override is a training signal. Store overrides, analyze patterns, retrain on high-frequency mistakes.

**Q: What if humans disagree on the same case?**

A: Expected in subjective categories. Use a tiebreaker rule (e.g., "if < 50% agreement, escalate to manager"). Or clarify the category until humans reach 90%+ agreement.

**Q: How do we prevent humans from rubber-stamping (always approving)?**

A: Monitor: if a human approves 95%+ of cases, something's wrong. Have managers spot-check their work. Rotate categories to avoid fatigue.

**Q: Should we escalate everything to be safe?**

A: No. HITL is expensive. Escalate only where it adds value. Routine decisions can be fully automated if the model is good.

**Q: What if we can't afford to hire enough reviewers?**

A: (1) Reduce escalation rate (improve model). (2) Batch reviews (one human handles 50 similar cases in 1 hour). (3) Automate obvious decisions (code the rules humans always follow). (4) Use async + longer SLA.

**Q: How do we measure whether HITL is working?**

A: Measure: escalation rate, human accuracy (downstream outcomes), feedback loop impact (does model improve?), cost per review, user satisfaction.

**Q: Can we appeal an AI decision?**

A: Yes, if you have HITL. User appeals → item re-enters queue at high priority → human re-reviews.
`,

  "interview-questions": `
### Junior-level

1. **What is HITL AI? How is it different from full automation or full human review?**

   Model answer: HITL (human-in-the-loop) means the AI makes most decisions, but for high-stakes or uncertain cases, a human reviews before the decision lands in production. It balances speed (AI) with safety/accuracy (humans). Full automation is faster but riskier; full human review is safer but doesn't scale.

2. **Design a HITL system for content moderation. When should content be escalated to humans?**

   Model answer: Escalate if: (1) AI confidence < 0.8 (borderline cases), (2) category is "appeal" (user disputes), (3) random sample (5%) for drift detection. Routine auto-removals (spam, obvious porn) don't need review. Escalate ambiguous cases (satire, context-dependent harm).

3. **What should be logged in an audit trail?**

   Model answer: Every decision (AI and human): timestamp, decision, confidence (for AI), human ID and reason (for human), and the request ID to link them. Audit logs must be immutable and discoverable for legal disputes.

### Senior-level

4. **You have a HITL system with 10,000 escalations/day. Humans can review 100/day. What do you do?**

   Model answer: (1) Reduce escalation rate—improve the model so fewer cases escalate. Target: 5–10%, not 100 escalations per 100 decisions. (2) Batch reviews—instead of 100 humans each reviewing 1 case, have 2 humans review 50 similar refunds together (1 hour instead of 5). (3) Automate obvious approvals—if 90% of a category auto-approve, code the rule. (4) Extend SLA if possible—async with 48-hour SLA scales better than sync with 4-hour SLA.

5. **How do you close a feedback loop? A human overrides an AI decision on a refund. What next?**

   Model answer: (1) Log the override: input, AI output, human output, reason. (2) Analyze patterns weekly: do refunds with clean account history get approved more often by humans than by AI? (3) Retrain: if pattern is clear, fine-tune the model on 100 recent overrides or update the prompt to weight account history more. (4) Measure impact: does accuracy improve? If yes, keep it; if no, investigate why.

6. **A user appeals a system decision. How do you handle it with HITL?**

   Model answer: (1) Escalate to a high-priority queue. (2) Route to a senior reviewer (not the original reviewer). (3) Provide full context: original decision, user's appeal reason, any new information. (4) Log the re-review and outcome. (5) If human reverses the original decision, investigate: was the original logic wrong, or did the user provide new info? Use this to improve.

7. **How do you measure whether a HITL system is working?**

   Model answer: (1) Escalation rate—is it 5–20% (healthy) or 50% (model is bad)? (2) Human accuracy—does downstream show humans are making correct calls? (3) Feedback loop impact—does model accuracy improve after humans override? (4) Cost per decision—is HITL adding value or burning money? (5) User satisfaction—do users trust escalations? (6) SLA compliance—do humans decide in time?

8. **Defend HITL for a high-stakes domain (medical diagnosis). An AI proposes a diagnosis; a human must approve.**

   Model answer: (1) Legal liability—if the AI is wrong and no human reviewed, who's responsible? (2) Audit trail—regulators require a human to sign off. (3) Error correction—humans catch AI hallucinations and wrong assumptions. (4) User trust—"AI + human review" users trust more than "AI alone." (5) Feedback loop—every human override teaches the model. The cost of HITL (slower, more expensive) is justified by the cost of error.
`,

  "coding-questions": `
### Problem 1: Implement an escalation router

~~~python
# Problem: Given a decision and escalation rules, determine if it should escalate.

from dataclasses import dataclass

@dataclass
class Decision:
    request_id: str
    category: str
    amount: float
    confidence: float

@dataclass
class EscalationRule:
    category: str
    condition: callable  # func(decision) -> bool
    priority: str

def should_escalate(decision, rules):
    """Check if decision matches any escalation rule."""
    for rule in rules:
        if rule.category == decision.category or rule.category == "*":
            if rule.condition(decision):
                return True, rule.priority
    return False, None

# Usage
rules = [
    EscalationRule("refund", lambda d: d.amount > 1000, "high"),
    EscalationRule("*", lambda d: d.confidence < 0.75, "medium"),
]

decision = Decision("req_1", "refund", 1500, 0.9)
should_esc, priority = should_escalate(decision, rules)
assert should_esc == True and priority == "high"
~~~

Follow-up: Extend to support AND/OR logic for multiple conditions.

~~~python
# Multiple conditions
EscalationRule("refund", lambda d: d.amount > 1000 AND d.confidence < 0.8, "high")
~~~

### Problem 2: Implement a review queue with SLA

~~~python
# Problem: Build a priority queue where items have SLAs (deadlines).

import heapq
from datetime import datetime, timedelta

class ReviewQueue:
    def __init__(self):
        self.heap = []  # Min-heap: (priority, deadline, item_id, item)
        self.items = {}  # item_id -> item

    def add(self, item, priority, sla_hours):
        deadline = datetime.now() + timedelta(hours=sla_hours)
        priority_score = (priority, deadline)  # Lower priority = higher urgency
        heapq.heappush(self.heap, (priority_score, item.id, item))
        self.items[item.id] = item

    def next_awaiting_review(self):
        # Return the highest-priority item that's not yet claimed
        while self.heap:
            _, item_id, item = heapq.heappop(self.heap)
            if item.status == "waiting":
                return item
        return None

    def claim(self, item_id):
        # Mark as claimed (locked)
        item = self.items[item_id]
        item.status = "claimed"
        item.claimed_at = datetime.now()

    def resolve(self, item_id, decision):
        item = self.items[item_id]
        item.decision = decision
        item.resolved_at = datetime.now()
        item.status = "resolved"
        item.sla_met = item.resolved_at <= item.deadline

# Test
queue = ReviewQueue()
queue.add(item1, priority=2, sla_hours=24)  # Low priority, 24h SLA
queue.add(item2, priority=1, sla_hours=4)   # High priority, 4h SLA

next_item = queue.next_awaiting_review()
assert next_item.id == item2.id  # High priority comes first
~~~

### Problem 3: Measure feedback loop impact

~~~python
# Problem: Given AI decisions and human overrides, measure model improvement.

def measure_feedback_loop_impact(decisions_before, decisions_after, overrides):
    """
    Measure: did the model improve after learning from overrides?
    """
    # Before: accuracy without feedback
    correct_before = sum(1 for d in decisions_before if d.correct)
    accuracy_before = correct_before / len(decisions_before)

    # Apply the feedback loop: retrain on overrides
    # (In real code, this would fine-tune the model)

    # After: accuracy with retrained model
    correct_after = sum(1 for d in decisions_after if d.correct)
    accuracy_after = correct_after / len(decisions_after)

    improvement = accuracy_after - accuracy_before

    return {
        "accuracy_before": accuracy_before,
        "accuracy_after": accuracy_after,
        "improvement_percentage_points": improvement * 100,
    }

# Test
before = [Decision("A", correct=True), Decision("B", correct=False)]
after = [Decision("A", correct=True), Decision("B", correct=True)]  # B now correct
impact = measure_feedback_loop_impact(before, after, overrides=[("B", True)])
assert impact["improvement_percentage_points"] == 50.0  # 50% -> 100%
~~~
`,

  "hands-on-labs": `
### Lab 1: Build a simple HITL queue (Beginner)

**Objective**: Implement a minimal HITL system with escalation and human review.

**Tasks**:
1. Define escalation rules (confidence < 0.8, amount > $500).
2. Implement a ReviewQueue that stores escalated items.
3. Implement a simple human interface (claim → decide → resolve).
4. Log all decisions to an audit trail.

**Deliverables**:
- Python code with Escalator, ReviewQueue, and AuditLog classes.
- Test with 10 sample decisions (5 escalate, 5 don't).
- Audit log shows full decision path.

### Lab 2: HITL with feedback loop (Intermediate)

**Objective**: Build HITL system that learns from human overrides.

**Tasks**:
1. Extend Lab 1: add FeedbackStore.
2. Implement override detection: when human rejects AI decision.
3. Analyze patterns weekly (which categories have low AI accuracy?).
4. Implement model improvement: update model prompt based on common mistakes.
5. Measure impact: does accuracy improve after retraining?

**Deliverables**:
- Code with feedback loop.
- Weekly analysis report (by category: override rate, accuracy before/after).
- Demonstration that model accuracy improved after feedback.

### Lab 3: Production-scale HITL (Advanced)

**Objective**: Deploy HITL to Kubernetes with queue, dashboard, monitoring.

**Tasks**:
1. Build a FastAPI backend for HITL queue (add, claim, resolve endpoints).
2. Build a React dashboard for humans (list items, claim, submit decision).
3. Deploy to Kubernetes with health checks, autoscaling.
4. Add Prometheus metrics: queue depth, SLA compliance, review latency.
5. Configure alerting: alert if queue > 1000 items or SLA < 95%.

**Deliverables**:
- Working backend + dashboard.
- Kubernetes manifests with autoscaling rules.
- Prometheus dashboard showing HITL health.
- Load test showing system handles 100 concurrent escalations.

### Lab 4: Feedback loop at scale (Advanced)

**Objective**: Process feedback from 1000s of human decisions, retrain model.

**Tasks**:
1. Collect human decisions on a representative sample (1000 items).
2. Analyze: which categories have the most overrides?
3. Retrain model on override data (via fine-tuning or prompt refinement).
4. A/B test: old model vs. retrained on same test set.
5. Measure: did accuracy improve? By how much?

**Deliverables**:
- Analysis report (override patterns by category).
- Retrained model code.
- A/B test results and comparison graphs.
`,

  "real-projects": `
### Project 1: HITL refund approval system

**Spec**:
- **Problem**: Refund requests arrive; AI agent assesses legitimacy. High-value refunds need human approval before payment is issued.
- **Escalation**: All refunds > $500 escalate to humans.
- **Queue**: High priority (> $2000); medium priority (> $500); low priority (< $500 but high risk).
- **Review**: Human checks account history, product, reason; approves/rejects.
- **Feedback**: Human decisions improve model (e.g., "clean accounts are more likely to be approved").
- **Output**: "Approved" or "Rejected" + reason, logged in audit trail.
- **Requirements**: < 4-hour SLA for high-priority, < 24-hour for others. 95% human accuracy. Model accuracy improves 2% per quarter via feedback.
- **Engineering challenges**: Handling edge cases (unusual products, new accounts), managing refund disputes, integrating payment API.

### Project 2: Content moderation with appeals

**Spec**:
- **Problem**: Platform removes content (spam, policy violation). Users can appeal. Need HITL to handle appeals fairly.
- **Escalation**: (1) All appeals from users. (2) Random 5% of auto-removals (drift detection).
- **Queue**: Appeals are high-priority (2-hour SLA); drift samples are low-priority (48-hour SLA).
- **Review**: Moderator reads content, user's appeal, context; approves/rejects appeal.
- **Feedback**: Overrides improve model (e.g., "this satire shouldn't have been removed").
- **Output**: Final decision + explanation to user; option to escalate further to manager.
- **Requirements**: 95%+ appeal compliance (all appeals reviewed). Moderate 1000 items/day with 10 humans.
- **Engineering challenges**: Sensitive content viewing, context preservation, integrating with content DB.

### Project 3: Loan approval with explainability

**Spec**:
- **Problem**: AI model approves/denies loans. Regulatory requirement: humans must review all decisions within 24 hours.
- **Escalation**: 100% escalation (all loans must go to humans eventually).
- **Queue**: High-risk (automated denial) at top; routine approvals at bottom.
- **Review**: Loan officer checks AI reasoning, reviews supporting docs, approves/denies.
- **Feedback**: Overrides inform model retraining and policy changes.
- **Output**: Final approval + comprehensive reasoning document (discoverable by regulators).
- **Requirements**: Zero appeal rate (if human said "yes," customer should be happy). SLA: 24 hours. All decisions fully explainable.
- **Engineering challenges**: Complex data (credit history, income docs), regulatory compliance, audit trail for 7 years.
`,

  "case-studies": `
### Case Study 1: Stripe's escalation system

**Context**: Stripe processes billions in payments. Fraud detection is critical but can't block legitimate transactions.

**Setup**: (1) Automated rules block obvious fraud. (2) ML model scores transactions; if 0.5–0.8, escalate to human review. (3) Humans approve/reject.

**Challenge**: Balancing false positives (blocking good transactions) vs. false negatives (letting fraud through).

**Solution**: They measure false positive rate carefully. If model is blocking 0.5% of good transactions, they lower the threshold (escalate fewer) and retrain on feedback. They adjust constantly to keep false positive rate < 0.1%.

**Result**: Fraud caught while 99.9% of legitimate transactions go through immediately.

**Lesson**: In payment systems, HITL isn't optional—it's structural. The cost of false positives (customer anger) vs. false negatives (fraud losses) requires human judgment.

### Case Study 2: GitHub's code review integration

**Context**: GitHub integrated AI-powered code review suggestions. But: should AI approve PRs automatically, or should humans always have a say?

**Setup**: AI suggests changes (style, security, logic). Developers can accept/reject AI suggestions. For critical repos, human code review is still required.

**Result**: Developers find AI suggestions helpful 70% of the time; they override 30%. Override feedback improved suggestion quality significantly.

**Lesson**: In developer tools, HITL takes the form of "AI suggests, human approves." Feedback from overrides is the primary signal for improvement.

### Case Study 3: Content moderation at Meta

**Context**: Meta removes millions of posts/day. Some are obvious (spam); most are ambiguous (does this violate harassment policy?).

**Setup**: Automated removal for obvious violations. Appeals go to humans. For borderline cases, AI flags and escalates to humans.

**Challenge**: Scale. Millions of escalations/day but only thousands of human reviewers.

**Solution**: (1) Batch similar items (100 similar flags reviewed together by one person in 1 hour vs. 100 disjoint cases in 10 hours). (2) Clear guidelines (reduce subjectivity). (3) Feedback loop: overrides improve model.

**Result**: Humans can handle the load. Appeal success rate is ~10% (9 out of 10 appeals are denied), suggesting humans and model largely agree.

**Lesson**: HITL at scale requires: batching, clear process, and continuous feedback loops.

### Case Study 4: Healthcare diagnostic assist

**Context**: An AI model assists radiologists in detecting breast cancer in mammograms.

**Setup**: 100% HITL (not optional—regulatory requirement). AI flags suspicious areas; radiologist has final say.

**Result**: Studies show AI + radiologist > either alone. Radiologists spend less time on obvious cases (AI flags those quickly) and more time on ambiguous ones.

**Lesson**: In high-stakes domains (medicine, law, finance), HITL isn't a cost center—it's a feature. Users trust "AI + expert human review" far more than "AI alone."
`,

  comparisons: `
| Approach | Automation | Speed | Accuracy | Cost | Trust | When to use |
|---|---|---|---|---|---|---|
| **Pure automation** | 100% AI | Fast | Medium (hallucinations, drift) | Low | Low (black box) | Routine, low-stakes |
| **HITL (light)** | 80% AI, 20% human | Medium | High (humans catch edge cases) | Medium | High (humans validate) | Most production cases |
| **HITL (heavy)** | 50% AI, 50% human | Slow | Very high | High | Very high | High-stakes (medical, legal, financial) |
| **Pure human** | 0% AI (humans only) | Slow | Very high (but subjective) | Very high | Very high | Highest stakes or novel decisions |

**How seniors choose**:
- **Prototype**: Pure automation if the task is simple and low-stakes.
- **Production (routine)**: Light HITL (escalate 5–10%, human reviews those).
- **Production (high-stakes)**: Heavy HITL (more humans in the loop, faster feedback).
- **Regulatory required**: Often 100% HITL even if AI is perfect (legal, medical).

Most teams start with light HITL and adjust based on metrics.
`,

  "related-technologies": `
- **Agent Fundamentals** (prerequisite): agents, decision-making loops.
- **Multi-Agent Systems** (prerequisite): orchestration, coordination.
- **Evaluation**: measuring whether decisions are correct.
- **Monitoring**: tracking HITL queue health, SLA compliance.
- **Logging**: recording every decision for audit trail.
- **Agent Observability**: tracing AI decisions to debug them.
- **LangGraph**: orchestration framework with approval nodes.
- **CrewAI**: multi-agent with human-in-the-loop capabilities.
- **AutoGen**: explicit human-agent conversation patterns.
- **Pydantic AI**: structured outputs (decisions are validated, easier for humans to review).
`,

  "latest-updates": `
As of 2025-07:

- **Regulatory pressure increases HITL adoption.** Financial regulators, healthcare systems, and content platforms are mandating human review for certain decisions. HITL is becoming a compliance requirement, not optional.
- **Better HITL UX tools emerge.** Products like Labelbox, Scale AI, and others provide polished dashboards for human review. HITL is no longer a custom build.
- **Feedback loop standardization.** OpenTelemetry is expanding to include feedback signals (human overrides); this makes feedback loops more portable.
- **Appeals and explainability become standard.** Users increasingly expect to appeal AI decisions and get clear explanations. Systems without appeals risk reputational damage.

**Verify with web search** for latest HITL platforms and regulatory guidance.
`,

  "future-roadmap": `
- **Year 2025**: HITL becomes the default for production AI (not the exception). Systems that are 100% autonomous will be seen as risky.
- **Year 2025–2026**: Better UX and automation for HITL—queues with smarter routing, batching, auto-redaction of PII, interfaces that make human decisions clear and fast.
- **Year 2026+**: Feedback loops become fully closed—human overrides automatically improve models with minimal engineering overhead.
- **Career bet**: HITL expertise is increasingly valuable. Engineers who can design scalable HITL systems (queue infrastructure, feedback loops, appeals processes) are in high demand.
`,

  "cheat-sheet": `
~~~python
# Quick reference: HITL patterns

# 1. Escalation router
def should_escalate(decision, rules):
    for rule in rules:
        if rule.matches(decision):
            return True, rule.priority
    return False, None

# 2. Review queue with SLA
queue = ReviewQueue()
queue.add(item, priority="high", sla_hours=2)
next_item = queue.next_awaiting_review()
queue.resolve(item.id, decision="approve")

# 3. Audit log (immutable)
await audit_log.record({
    "timestamp": now(),
    "type": "human_decision",
    "request_id": request_id,
    "human_id": human_id,
    "decision": decision,
})

# 4. Feedback loop
overrides = await feedback_store.get_human_overrides()
patterns = analyze_patterns(overrides)
if patterns.low_accuracy_in_category:
    await retrain_model(overrides)

# 5. SLA monitoring
sla_met = sum(1 for item in resolved if item.latency < item.sla)
compliance = sla_met / len(resolved)
assert compliance > 0.95  # Target

# 6. Appeals workflow
if user_appeal:
    await escalate(request, priority="high")
    await notify_manager("Appeal from user_id")
~~~
`,

  "flash-cards": `
| Q | A |
|---|---|
| What is HITL? | Human-in-the-loop: AI makes decisions, humans review high-stakes/uncertain ones before production. |
| When should a decision escalate? | High stakes (financial, legal), low AI confidence, policy-required, or appeals. |
| What is an audit trail? | Complete, immutable log of every decision (AI and human), with timestamp, reason, and attribution. |
| How do you close a feedback loop? | Capture human overrides → analyze patterns → retrain model → measure improvement. |
| What's the target escalation rate? | 5–20% depending on domain. > 25% means model is bad; < 5% means maybe over-automating. |
| How do you scale HITL? | Reduce escalation rate (improve model), batch similar items (humans review 50 together), automate obvious rules. |
| What's SLA in HITL? | Time limit to review an escalated item. E.g., 2 hours for critical, 24 hours for routine. |
| How do you measure human accuracy? | Infer from downstream: does the user accept the decision? Does it lead to disputes? |
| Why is HITL important in regulated domains? | Legal, medical, financial require human accountability. "The AI decided it" is not a legal defense. |
| Should HITL block users? | No, usually async. Return "pending review" immediately, notify user when decided. |
`,

  mcqs: `
1. **You have 10,000 decisions/day. 15% escalate to humans. Humans can review 100/day. What's wrong?**
   - a) Not enough humans; hire 1500
   - **b) Escalation rate too high; reduce to 1–3% by improving model**
   - c) Humans are slow; buy better tools
   - d) SLA is too tight

2. **A human overrides an AI decision. What should you do?**
   - a) Log it and move on
   - **b) Store it as a training signal; analyze patterns; use to improve model**
   - c) Investigate why human is wrong
   - d) Adjust escalation rules

3. **HITL audit logs should be:**
   - a) Stored in a normal database (fast, flexible)
   - **b) Append-only and immutable (legal defensibility)**
   - c) Deleted after 30 days (privacy)
   - d) Readable only by managers

4. **To scale HITL from 100 to 10,000 escalations/day, you should:**
   - a) Hire 100 humans
   - **b) Reduce escalation rate (improve model), batch reviews, automate obvious rules**
   - c) Switch to async and increase SLA
   - d) Add more review queues

5. **User appeals an AI decision. What does HITL do?**
   - a) Deny the appeal (users can't second-guess AI)
   - **b) Re-escalate to a high-priority queue; human re-reviews; log outcome**
   - c) Explain the AI's reasoning
   - d) Let the user dispute with legal team

6. **Human accuracy in HITL should be:**
   - a) > 99% (humans must be perfect)
   - **b) > 90% (humans make mistakes, but most are right)**
   - c) > 80% (humans are unreliable)
   - d) Unmeasurable (too subjective)
`,

  "revision-notes": `
**HITL (human-in-the-loop)** is the practice of having humans review and approve high-stakes or uncertain AI decisions before they land in production. It's not a sign of failure—it's a structural requirement of production AI.

**Core pattern**: AI makes decision → check escalation rule → if yes, enqueue for human → human approves/rejects/modifies → log feedback → decision lands in production (AI + human override).

**Escalation triggers**: confidence < threshold (model is unsure), policy rule (high-stakes category), or sampling (5% to catch drift). Don't escalate because the model is bad; that's a model problem, not a HITL problem.

**Feedback loops**: Every human override is a training signal. Store it, analyze patterns weekly, use to retrain the model or improve prompts. Without feedback loops, HITL is just a bottleneck.

**Queue management**: Escalated items wait in a priority queue. High-priority items (financial, legal, appeals) at top; low-priority at bottom. SLA for each priority: 2–4 hours for critical, 24+ hours for routine (usually async).

**Audit trails**: Everything logged. Every decision (AI and human) recorded with timestamp, request ID, human ID, and reason. Audit logs must be immutable (append-only, not editable). Legal discovery depends on these.

**Measuring effectiveness**: Escalation rate (healthy: 5–20%), human accuracy (downstream outcomes, > 90%), feedback loop impact (does model improve?), cost per review, SLA compliance (> 95%).

**Scaling**: Reduce escalation rate (improve model), batch similar items, automate obvious rules. Hiring humans to handle escalations doesn't scale; fix the model instead.

**Production requirements**: Clear escalation rules, persistent queue, human dashboard, SLA monitoring, audit logging, feedback loop, appeals process, human training.
`,

  "learning-roadmap": `
**Week 1: Foundations**
- Read overview, history, why-it-exists.
- Understand: when is HITL necessary? (High-stakes, ambiguity, liability)
- Lab: write a simple escalation router (confidence threshold).

**Week 2: Core infrastructure**
- Study intermediate-concepts (escalation rules, feedback loops, audit trails).
- Understand: how to design a review queue, how to measure SLA.
- Lab: build a ReviewQueue class with priority, SLA, claim/resolve.

**Week 3: Feedback & improvement**
- Study feedback loops, batching, cost optimization.
- Lab: implement feedback storage, override analysis, mock retraining.

**Week 4: Production**
- Study testing, monitoring, deployment, and production-checklist.
- Lab: build a FastAPI backend for HITL queue, add Prometheus metrics.

**Week 5: Advanced topics**
- Study security, scale, regulatory requirements.
- Mock interview: design HITL for a high-stakes domain (medical, financial).

**Week 6: Capstone**
- Lab 3: Deploy HITL to Kubernetes with dashboard, monitoring, alerting.
- Lab 4: Process feedback from 1000 decisions, retrain model, measure impact.

**After this skill**: Learn **Evaluation** (measuring decision quality), **Monitoring** (operational health), or **Agent Observability** (tracing AI decisions for debugging).

Next platform skill: **AI Observability** or **Evaluation**, depending on your role.
`,

  "official-docs": `
- **Anthropic Constitutional AI** (docs.anthropic.com): Human feedback framework for alignment.
- **OpenTelemetry** (opentelemetry.io): Tracing and observability; includes feedback signals.
- **LangGraph** (langchain.com/docs/langgraph): Orchestration with explicit approval nodes.
- **CrewAI** (docs.crewai.com): Role-based agent framework with escalation.
- **Labelbox** (labelbox.com): Platform for human review workflows.
- **Scale AI** (scale.com): Data labeling and human feedback at scale.
`,

  books: `
- **"Human-in-the-Loop Machine Learning"** (Monarch, 2021). Comprehensive coverage of active learning, annotation, and feedback loops.
- **"The Ethical Algorithm"** (Kearns & Roth, 2019). Fairness and human oversight in AI systems.
- **"Designing Data-Intensive Applications"** (Kleppmann, 2017). Distributed systems thinking relevant to HITL infrastructure.
`,

  blogs: `
- **Anthropic blog** (anthropic.com/research): Constitutional AI, RLHF-from-human-feedback.
- **LangChain blog** (blog.langchain.dev): HITL patterns and examples.
- **Chips and Salsa** (various). Discussions on feedback loops and human oversight in production AI.
`,

  "research-papers": `
- **"RLHF from Human Feedback"** (Christiano et al., 2017 / updated 2023). Foundation for feedback loops in HITL systems.
- **"Constitutional AI"** (Anthropic, 2023). Framework for human feedback in alignment.
- **"Active Learning" surveys** (JMLR / IEEE). Literature on strategically escalating uncertain samples.

For specific case studies, search for papers from Meta (content moderation), Stripe (fraud), or healthcare vendors.
`,

  videos: `
- **Anthropic YouTube: Constitutional AI**: How human feedback guides model improvement.
- **LangChain office hours**: HITL patterns in LangGraph and CrewAI.
- **Full stack deep learning course**: Segment on human-in-the-loop ML systems.
`,

  "github-repos": `
- **langchain-ai/langgraph** (github.com/langchain-ai/langgraph): Approval nodes, human interaction examples.
- **joaomdmoura/crewai** (github.com/joaomdmoura/crewai): Human-in-the-loop agent orchestration.
- **anthropics/constitutional-ai** (example implementations of feedback loops and RLHF).
- **opentelemetry** (opentelemetry.io): SDKs for feedback signal tracing.
- **labelbox/labelbox** (github.com/labelbox): Open-source human review dashboard.
`,

  "practice-problems": `
**Ordered by skill focus**:

1. **Basic escalation**: Write a function that routes decisions based on confidence and category.
2. **Queue management**: Implement a priority queue with SLA tracking.
3. **Feedback loop**: Analyze human overrides; detect categories with low AI accuracy.
4. **Audit logging**: Implement append-only, immutable audit log.
5. **Scaling**: Design HITL for 10,000 escalations/day with 10 humans.
6. **Monitoring**: Build dashboards for queue depth, SLA compliance, human accuracy.
7. **Appeals**: Implement user appeal workflow (re-escalate, notify, log).
8. **Integration**: End-to-end test: request escalates → human reviews → decision lands in production.
9. **System design interview**: "Design HITL for a financial lending platform."

External: LeetCode "system design" + "queue" tags, Codeforces (simulation problems).
`,

  "architecture-diagram": `
Reference production HITL architecture:

~~~mermaid
graph TB
    Client["Client / User"] -->|request| API["API Gateway"]

    API -->|async| Agent["Agent"]

    Agent -->|decision + confidence| Router["Escalation Router<br/>Confidence? Category? Amount?"]

    Router -->|escalate| Queue["Review Queue<br/>Priority-based<br/>SLA-tracked"]
    Router -->|approve| ProductionDB["Production DB<br/>Decision applied"]

    Queue -->|assign to human| HumanDash["Human Review Dashboard<br/>UI for decision-making"]

    HumanDash -->|human submits decision| HumanStore["Human Decision Store<br/>With full audit trail"]

    HumanStore -->|finalize decision| ProductionDB

    HumanStore -->|feedback signal| FeedbackAnalyzer["Feedback Analyzer<br/>Weekly pattern detection"]

    FeedbackAnalyzer -->|update| ModelImprovement["Model Improvement<br/>Fine-tune / prompt / RAG"]

    ModelImprovement -->|retrained model| Agent

    Agent & Queue & HumanStore -->|metrics/SLA| Observability["Observability<br/>Prometheus + Grafana"]

    AuditLog["Audit Log<br/>Immutable, append-only<br/>Legal discovery"] -.->|record every decision| HumanStore

    subgraph "AI Decision"
        Agent
    end

    subgraph "Routing & Review"
        Router
        Queue
        HumanDash
    end

    subgraph "Storage & Improvement"
        ProductionDB
        HumanStore
        FeedbackAnalyzer
        ModelImprovement
    end
~~~

Each layer is independent. Queue can be replaced with a different backend. Model improvement can use different techniques. Audit log is a requirement, not optional.
`,

  "mind-map": `
~~~mermaid
mindmap
  root((Human-in-the-Loop AI))
    Core Concept
      Escalation triggers
        Confidence threshold
        Policy rules
        Sampling
      Review queue
        Priority-based
        SLA-tracked
        Async (usually)
    Infrastructure
      Queue
        Persistent store
        Priority ordering
        Claim/release
      Human dashboard
        List assigned items
        Show AI reasoning
        Decision UI
      Audit trail
        Every decision logged
        Immutable
        Legally discoverable
    Feedback Loops
      Override capture
        What AI said
        What human said
        Why
      Pattern analysis
        Low-accuracy categories
        Systematic failures
      Model improvement
        Retraining
        Prompt refinement
        RAG enhancement
    Operational
      Escalation rate
        Healthy: 5–20%
        Too high: model is bad
        Too low: maybe over-auto
      SLA compliance
        Critical: 2–4h
        Routine: 24h+
        Monitor: > 95% met
      Human accuracy
        Measure downstream
        Target: > 90%
      Cost per review
        Optimize via batching
        Reduce via automation
    Scaling
      Reduce escalations
        Improve model accuracy
      Batch reviews
        Similar items together
      Automation
        Obvious rules as code
      Hire thoughtfully
        Training overhead
        Specialist routing
    Security
      Access control
        Who can review what
      Audit trail
        Immutable records
      PII handling
        Redaction vs. need-to-know
      Bias detection
        Unusual patterns
    Production Requirements
      Clear rules
      Queue + dashboard
      Monitoring + alerts
      Appeals process
      Feedback infrastructure
    Applications
      Financial (high-stakes)
      Content moderation (scale)
      Healthcare (regulation)
      Customer support (quality)
      Legal review (compliance)
~~~
`,
};

export default humanInTheLoop;
