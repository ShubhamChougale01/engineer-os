import type { CheatSheetData } from "./types";

const autogen: CheatSheetData = {
  title: "The Ultimate AutoGen Cheat Sheet",
  subtitle: "ConversableAgent, AssistantAgent/UserProxyAgent, GroupChat, termination, sandboxed execution, and production guardrails",
  sections: [
    {
      title: "Core Primitives & Setup",
      color: "violet",
      rows: [
        { term: "ConversableAgent", desc: "Base class: sends/receives messages, pluggable reply logic", code: "from autogen import ConversableAgent\nagent = ConversableAgent(name='agent',\n  llm_config={'config_list': [{'model': 'gpt-4o-mini'}]})" },
        { term: "AssistantAgent", desc: "LLM-backed reasoner; proposes solutions/code, never executes", code: "from autogen import AssistantAgent\nassistant = AssistantAgent(name='assistant',\n  system_message='You write correct, tested code.',\n  llm_config=llm_config)" },
        { term: "UserProxyAgent", desc: "Human/executor stand-in; can run code and relay human input", code: "from autogen import UserProxyAgent\nuser_proxy = UserProxyAgent(name='user_proxy',\n  human_input_mode='NEVER')" },
        { term: "human_input_mode", desc: "ALWAYS every turn, TERMINATE near the end, NEVER fully automated", code: "human_input_mode='TERMINATE'" },
        { term: "initiate_chat", desc: "Starts a conversation between two agents", code: "result = user_proxy.initiate_chat(assistant,\n  message='Write and test fib(n).')" },
        { term: "ChatResult", desc: "Full transcript, LLM-generated summary, and cost/usage", code: "result.chat_history\nresult.summary\nresult.cost" },
        { term: "llm_config", desc: "Model, timeout, temperature per agent", code: "llm_config = {'config_list': [{'model': 'gpt-4o-mini',\n  'timeout': 30}], 'temperature': 0.2}" },
      ],
    },
    {
      title: "Code Execution & Safety",
      color: "blue",
      rows: [
        { term: "DockerCommandLineCodeExecutor", desc: "Sandboxed, isolated code execution — the safe default", code: "from autogen.coding import DockerCommandLineCodeExecutor\nexecutor = DockerCommandLineCodeExecutor(\n  image='python:3.12-slim', timeout=60, work_dir='coding')" },
        { term: "code_execution_config", desc: "Attaches an executor to a UserProxyAgent", code: "UserProxyAgent(..., code_execution_config={'executor': executor})" },
        { term: "Propose vs execute split", desc: "AssistantAgent proposes code; UserProxyAgent runs it — never merge these", code: "# a code-review-style separation of concerns" },
        { term: "Never unsandboxed", desc: "Bare local execution of LLM-generated code is a real security risk", code: "# avoid use_docker=False outside a fully trusted throwaway env" },
        { term: "Execution timeout", desc: "Hard wall-clock cap so a runaway generated script can't hang the run", code: "DockerCommandLineCodeExecutor(..., timeout=60)" },
        { term: "Execution result feedback", desc: "stdout/stderr/traceback becomes the next message automatically", code: "# assistant reads the result and revises its code on the next turn" },
      ],
    },
    {
      title: "GroupChat & Coordination",
      color: "emerald",
      rows: [
        { term: "GroupChat", desc: "Coordinates a conversation among 3+ agents", code: "from autogen import GroupChat, GroupChatManager\ngroupchat = GroupChat(agents=[user_proxy, coder, critic],\n  messages=[], max_round=12)" },
        { term: "GroupChatManager", desc: "Orchestrator agent: decides who speaks next each round", code: "manager = GroupChatManager(groupchat=groupchat, llm_config=llm_config)\nuser_proxy.initiate_chat(manager, message='...')" },
        { term: "speaker_selection_method='auto'", desc: "An LLM decides next speaker — flexible but adds cost/unpredictability", code: "GroupChat(..., speaker_selection_method='auto')" },
        { term: "speaker_selection_method='round_robin'", desc: "Fixed rotation — cheaper, predictable, prefer once roster is known", code: "GroupChat(..., speaker_selection_method='round_robin')" },
        { term: "allowed_or_disallowed_speaker_transitions", desc: "Constrains legal next-speaker transitions explicitly", code: "GroupChat(..., allowed_or_disallowed_speaker_transitions={\n  coder: [critic], critic: [coder, user_proxy]},\n  speaker_transitions_type='allowed')" },
        { term: "Nested chats", desc: "An agent spins off a sub-conversation, folds result back as one reply", code: "# scope a specialist sub-task without growing the main roster" },
        { term: "register_reply", desc: "Insert custom Python logic into an agent's reply pipeline", code: "agent.register_reply([AssistantAgent, None], custom_reply, position=0)" },
      ],
    },
    {
      title: "Termination & Guardrails",
      color: "amber",
      rows: [
        { term: "is_termination_msg", desc: "Phrase-based check for when a conversation should stop", code: "def is_termination_msg(msg):\n    return 'TERMINATE' in (msg.get('content') or '')" },
        { term: "max_consecutive_auto_reply", desc: "Hard numeric ceiling — mandatory backstop, never rely on phrase alone", code: "UserProxyAgent(..., max_consecutive_auto_reply=8)" },
        { term: "max_round", desc: "Hard ceiling on total GroupChat turns", code: "GroupChat(..., max_round=12)" },
        { term: "Non-terminating conversations", desc: "Fragile phrase matching + no ceiling; pair both, make criteria concrete", code: "# 'reply LGTM once all tests pass' beats 'reply when satisfied'" },
        { term: "Agents agreeing too easily", desc: "Subjective LLM critique converges on agreement regardless of correctness", code: "# fix: give critic an external test suite/rubric, not just judgment" },
        { term: "Objective critic pattern", desc: "Ground critique in real test-suite output, not subjective review", code: "proc = subprocess.run(['pytest', dir, '-q'], capture_output=True)\n# feed proc.stdout/returncode into the critic's next message" },
        { term: "Loop detection", desc: "Near-duplicate consecutive messages signal a stall, not progress", code: "from difflib import SequenceMatcher\nSequenceMatcher(None, msg_a, msg_b).ratio()" },
      ],
    },
    {
      title: "Comparisons & When to Use What",
      color: "rose",
      rows: [
        { term: "AutoGen vs CrewAI", desc: "Open-ended conversation, unknown round count vs declared tasks/roles", code: "# CrewAI wins when division of labor is known/plannable" },
        { term: "AutoGen vs LangGraph", desc: "Emergent conversational flow vs explicit hand-wired graph/state", code: "# LangGraph wins on precise branching/state control" },
        { term: "AutoGen vs OpenAI Agents SDK", desc: "Full conversational framework vs minimal native primitives", code: "# Agents SDK wins for the lightest possible abstraction" },
        { term: "Best AutoGen fit", desc: "Iterative propose-execute-observe-fix loops; debate/critique patterns", code: "# classic: write code, run it, fix it, repeat until tests pass" },
        { term: "Cost multiplier", desc: "N rounds = ~N reply calls, +1 selection call/round under auto", code: "# a 12-round, 3-agent auto GroupChat can be 20+ LLM calls" },
        { term: "AutoGen vs AG2", desc: "AG2 is a community fork post-governance-split; check which one you're using", code: "# import paths and architecture differ between the two" },
        { term: "Hedge honestly", desc: "0.4 rearchitecture (Core/AgentChat/Extensions) changed the API substantially", code: "# always verify current docs before pinning to one syntax" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "Small, constrained rosters", desc: "Start with 2 agents; add participants only with a named, justified role", code: "# resist growing GroupChat rosters ad hoc over time" },
        { term: "Sync vs async serving", desc: "Short 2-agent chats sync; GroupChat/human-in-loop chats async job queue", code: "# celery/async worker + polling or webhook result delivery" },
        { term: "Isolated sandbox container", desc: "Run the code executor as a separate container from the API process", code: "# restricted network access + scoped, ephemeral filesystem" },
        { term: "Per-conversation logging", desc: "Log full transcript, round count, and cost, not just the summary", code: "log.info('autogen_conversation', num_turns=len(result.chat_history),\n  cost=result.cost)" },
        { term: "Clean-termination rate", desc: "Track how often is_termination_msg fires before hitting the ceiling", code: "# a low rate signals fragile termination-phrase logic" },
        { term: "Rate limit/auth endpoints", desc: "Size quotas to the conversation's round/roster LLM-call multiplier", code: "# a 12-round GroupChat endpoint needs much more headroom than 1 call" },
        { term: "Testing doctrine", desc: "Assert outcome properties (tests passed, terminated in range), never exact text", code: "assert proc.returncode == 0\nassert len(result.chat_history) <= 12" },
        { term: "Non-transactional runs", desc: "Earlier turns (and executed code) may have already cost money before failure", code: "try:\n    result = user_proxy.initiate_chat(...)\nexcept Exception as e:\n    raise RuntimeError(f'Conversation failed: {e}') from e" },
        { term: "Justify in writing", desc: "Document why the task needed conversation, not a fixed pipeline", code: "# 'why conversational' documented in the README, backed by a golden set" },
      ],
    },
  ],
};

export default autogen;
