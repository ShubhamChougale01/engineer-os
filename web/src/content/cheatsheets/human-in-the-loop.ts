import type { CheatSheetData } from "./types";

const humanInTheLoop: CheatSheetData = {
  title: "The Ultimate Human-in-the-Loop AI Cheat Sheet",
  subtitle: "Escalation · review queues · feedback loops · auditing · scaling HITL systems",
  sections: [
    {
      title: "Core Patterns",
      color: "violet",
      rows: [
        { term: "Escalation rule", desc: "Condition that triggers human review", code: "if confidence < 0.8:\n    escalate(request)\nif amount > 5000:\n    escalate(request)\nif random() < 0.05:  # 5% sample\n    escalate(request)" },
        { term: "Review queue", desc: "Async queue where escalated items wait for humans", code: "queue.add(request, priority='high', sla_hours=2)\nnext_item = queue.next_awaiting_review()\nqueue.resolve(item_id, decision='approve')" },
        { term: "SLA (Service Level Objective)", desc: "Time limit to review an escalated item", code: "high_priority: 2-4 hours\nroutine: 24+ hours\ntarget: 95%+ compliance" },
        { term: "Audit trail", desc: "Immutable log of every decision (AI + human)", code: "log({\n  timestamp: now(),\n  type: 'human_decision',\n  human_id: 'user_123',\n  decision: 'approved',\n})" },
        { term: "Feedback loop", desc: "Use human overrides to improve the model", code: "overrides = get_human_overrides()\npatterns = analyze(overrides)\nif patterns.low_accuracy:\n    finetune_model(overrides)" },
        { term: "Appeals", desc: "User challenges AI decision → human re-reviews", code: "if user_appeal:\n    escalate(request, priority='high')\n    assign_to_senior_reviewer()" },
      ],
    },
    {
      title: "Queue Management",
      color: "blue",
      rows: [
        { term: "Priority levels", desc: "Critical (2h), high (4h), medium (24h), low (72h)", code: "high_stakes → critical\nuser_appeal → high\nroutine → medium\nsampling → low" },
        { term: "Claim / release", desc: "Human claims an item (locks it); releases if can't handle", code: "queue.claim(item_id, human_id)\ntry: review(item)\nfinally: queue.release(item_id)" },
        { term: "Batch processing", desc: "Review similar items together (50 refunds in 1h vs 5h)", code: "by_category = groupby(queue, 'category')\nfor batch in by_category:\n    human.review_batch(batch)  # Efficient" },
        { term: "Queue metrics", desc: "Monitor health: depth, age, SLA compliance", code: "depth = queue.size()\noldest_age = queue.oldest().age\nsla_met = count(met_sla) / total" },
        { term: "Backlog management", desc: "If queue grows > capacity, reduce escalations", code: "if queue.size() > max_capacity:\n    reduce_escalation_threshold()" },
        { term: "Escalation to escalation", desc: "If human can't decide, escalate to manager", code: "if difficult_decision:\n    escalate_to_manager(item)" },
      ],
    },
    {
      title: "Escalation Rules",
      color: "emerald",
      rows: [
        { term: "Confidence-based", desc: "Escalate if AI confidence < threshold", code: "if confidence < 0.75:\n    escalate()" },
        { term: "Category-based", desc: "Escalate high-stakes categories always", code: "if category in ['legal', 'medical', 'financial']:\n    escalate()" },
        { term: "Amount-based", desc: "Escalate large financial transactions", code: "if amount > 5000:\n    escalate()" },
        { term: "Sampling", desc: "Escalate random X% to catch model drift", code: "if random() < 0.05:  # 5%\n    escalate()" },
        { term: "Policy rule", desc: "Custom logic: user status, product type, etc.", code: "if customer.is_vip:\n    dont_escalate()  # Fast-track\nif product.is_new:\n    escalate()  # Extra caution" },
        { term: "Composition", desc: "Multiple rules; OR logic (escalate if ANY match)", code: "escalate_if = (\n  (confidence < 0.7) OR\n  (amount > 5000) OR\n  (category == 'appeal')\n)" },
      ],
    },
    {
      title: "Feedback & Improvement",
      color: "amber",
      rows: [
        { term: "Capture override", desc: "Store: AI said X, human said Y", code: "feedback = {\n  ai_output: decision.output,\n  human_override: human.decision,\n  reason: human.reason,\n}" },
        { term: "Analyze patterns", desc: "Weekly: which categories have low AI accuracy?", code: "by_category = groupby(overrides, 'category')\nfor cat, cases in by_category:\n  accuracy = 1 - (len(overridden) / total[cat])" },
        { term: "Retrain on overrides", desc: "Fine-tune model on cases humans got right", code: "training_data = feedback_store.recent_overrides()\nmodel.finetune(training_data)" },
        { term: "Improve prompts", desc: "If humans override for consistent reason, update prompt", code: "# Old prompt: 'Approve if account is clean'\n# New prompt: 'Approve if account has 90+ day history AND no chargebacks'" },
        { term: "Improve RAG", desc: "If context is missing, enhance retrieval", code: "if overrides.reason == 'missing_context':\n    improve_retrieval()" },
        { term: "Measure impact", desc: "Model accuracy before vs. after feedback", code: "accuracy_before = 85%\naccuracy_after = 88%\nimprovement = 3 percentage points" },
      ],
    },
    {
      title: "Auditing & Compliance",
      color: "rose",
      rows: [
        { term: "Immutable audit log", desc: "Append-only log; no edits/deletes; legally defensible", code: "audit_log.append({  # Write-once\n  timestamp: now(),\n  decision: human.choice,\n  human_id: human.id,\n})" },
        { term: "Full attribution", desc: "Know who made each decision and why", code: "log.query(request_id)\n# Returns: AI decision → escalation reason → human decision → approval" },
        { term: "Trace request through HITL", desc: "End-to-end: AI → queue → human → production", code: "for event in audit_log.query(request_id):\n  print(f\"{event.timestamp}: {event.type}\")" },
        { term: "Data retention", desc: "Keep audit logs for legal discovery (7+ years)", code: "retention_policy = 7_years\narchive_to = s3_cold_storage" },
        { term: "PII redaction", desc: "Mask sensitive data in human dashboard, keep in audit log", code: "dashboard_view.ssn = 'XXX-XX-XXXX'  # Masked\naudit_log.ssn = original_ssn  # Full (immutable)" },
        { term: "Access control", desc: "Only lawyers review legal items; financial experts review transfers", code: "if category == 'legal' and not has_role(human, 'lawyer'):\n  raise PermissionError()" },
      ],
    },
    {
      title: "Metrics & Monitoring",
      color: "cyan",
      rows: [
        { term: "Escalation rate", desc: "% of decisions that escalate; healthy: 5–20%", code: "escalation_rate = escalations / total_decisions\nif escalation_rate > 0.25:\n  alert('model degrading')" },
        { term: "SLA compliance", desc: "% of items resolved within SLA deadline", code: "met = count(resolved_time < sla)\ncompliance = met / total\nassert compliance > 0.95" },
        { term: "Review latency", desc: "Time from escalation to human decision", code: "median: 95 min (target: < 4h)\np95: 1440 min (target: < 24h)" },
        { term: "Human accuracy", desc: "% of human decisions that were 'correct' (inferred)", code: "accuracy = correct_decisions / total_reviewed\ntarget: > 90%" },
        { term: "Queue health", desc: "Monitor depth and age; alert if growing", code: "gauge('queue_depth', len(queue))\nif queue.size() > 5000:\n  alert('backlog')" },
        { term: "Cost per review", desc: "Human labor time divided by outcome", code: "cost = (hours_spent * salary_per_hour) / reviews\noptimize: batch, automate, specialist routing" },
      ],
    },
  ],
};

export default humanInTheLoop;
