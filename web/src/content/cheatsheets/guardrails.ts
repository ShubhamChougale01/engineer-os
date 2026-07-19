import type { CheatSheetData } from "./types";

const guardrailsCheatSheet: CheatSheetData = {
  title: "Guardrails",
  subtitle: "Input/output safety and policy enforcement",
  sections: [
    {
      title: "Why Guardrails Exist",
      color: "violet",
      rows: [
        { term: "RLHF isn't a guarantee", desc: "Jailbreaks + ordinary generation quirks still occur" },
      ],
    },
    {
      title: "Input vs Output Guardrails",
      color: "blue",
      rows: [
        { term: "Input", desc: "Filter BEFORE the model sees the request" },
        { term: "Output", desc: "Validate BEFORE the response reaches the user" },
        { term: "Both needed", desc: "Each catches a genuinely different problem class" },
      ],
    },
    {
      title: "Defense in Depth",
      color: "emerald",
      rows: [
        { term: "Rule-based", desc: "Fastest/cheapest, easily circumvented" },
        { term: "Classifier-based", desc: "Moderate cost, more robust to rephrasing" },
        { term: "LLM-based", desc: "Slowest/priciest, most nuanced — reserve for ambiguous cases" },
      ],
    },
    {
      title: "Structured Output Validation",
      color: "amber",
      rows: [
        { term: "Validate schema", desc: "Before trusting output downstream" },
        { term: "On failure", desc: "Retry with a corrective prompt, don't just fail outright" },
      ],
    },
    {
      title: "Calibration Tradeoff",
      color: "rose",
      rows: [
        { term: "Too strict", desc: "False positives — blocks legitimate requests" },
        { term: "Too permissive", desc: "False negatives — harmful content slips through" },
        { term: "No universal answer", desc: "Calibrate to the app's genuine risk profile" },
      ],
    },
    {
      title: "Agentic Systems",
      color: "cyan",
      rows: [
        { term: "Beyond content filtering", desc: "Action-level constraints: autonomous vs human-confirm-required" },
        { term: "Not an absolute guarantee", desc: "Continuous evaluation + red-teaming, ongoing" },
      ],
    },
  ],
};

export default guardrailsCheatSheet;
