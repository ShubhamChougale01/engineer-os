import type { CheatSheetData } from "./types";

const promptEngineeringCheatSheet: CheatSheetData = {
  title: "Prompt Engineering",
  subtitle: "Getting reliable behavior out of models",
  sections: [
    {
      title: "Zero-Shot vs Few-Shot",
      color: "violet",
      rows: [
        { term: "Zero-shot", desc: "Task instruction only, no examples" },
        { term: "Few-shot", desc: "2+ example input->output pairs demonstrating the pattern" },
      ],
    },
    {
      title: "Chain-of-Thought",
      color: "blue",
      rows: [
        { term: "Why it works", desc: "Externalizes reasoning as tokens the model can condition on" },
        { term: "Zero-shot trigger", desc: "\"Let's think step by step\" — works without examples" },
        { term: "Self-consistency", desc: "Sample multiple CoT paths, majority vote — costs Nx" },
      ],
    },
    {
      title: "Prompt Structure",
      color: "emerald",
      rows: [
        { term: "System prompt", desc: "Persistent behavior/persona for the whole conversation" },
        { term: "User message", desc: "Per-turn actual conversation content" },
        { term: "Delimiters", desc: "Separate instructions from content — reduces misinterpretation" },
      ],
    },
    {
      title: "Structured Output",
      color: "amber",
      rows: [
        { term: "Best practice", desc: "Schema instructions + few-shot + dedicated JSON mode" },
        {
          term: "Always handle failures",
          desc: "Retry with corrective prompt on parse error",
          code: "try: json.loads(text)\nexcept: retry_with_corrective_prompt(text)",
        },
      ],
    },
    {
      title: "ReAct",
      color: "rose",
      rows: [
        { term: "Reason + Act", desc: "Interleaves reasoning, tool-use actions, and observations" },
      ],
    },
    {
      title: "Escalation Order",
      color: "cyan",
      rows: [
        { term: "Cheapest first", desc: "Zero-shot -> few-shot -> CoT -> self-consistency" },
        { term: "Last resort", desc: "Fine-tuning — only once prompting is genuinely exhausted" },
      ],
    },
  ],
};

export default promptEngineeringCheatSheet;
