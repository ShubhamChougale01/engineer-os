import type { CheatSheetData } from "./types";

const langchain: CheatSheetData = {
  title: "The Ultimate LangChain Cheat Sheet",
  subtitle: "LCEL composition · prompts & parsers · retrieval & memory · tools & agents · resilience · production toolbelt",
  sections: [
    {
      title: "Core Setup & LCEL Composition",
      color: "violet",
      rows: [
        { term: "Install", desc: "Core package plus provider-specific packages", code: "pip install langchain-core langchain\npip install langchain-openai langchain-anthropic" },
        { term: "ChatModel", desc: "Provider-agnostic chat model wrapper", code: "from langchain_openai import ChatOpenAI\nmodel = ChatOpenAI(model='gpt-4o-mini', temperature=0.1,\n  timeout=20, max_retries=2)" },
        { term: "ChatPromptTemplate", desc: "Parameterized, role-tagged prompt", code: "from langchain_core.prompts import ChatPromptTemplate\nprompt = ChatPromptTemplate.from_messages([\n  ('system', '...{var}...'), ('human', '{input}')])" },
        { term: "StrOutputParser", desc: "Extract plain text from the model response", code: "from langchain_core.output_parsers import StrOutputParser" },
        { term: "The pipe operator", desc: "Compose Runnables into one chain object", code: "chain = prompt | model | StrOutputParser()" },
        { term: "invoke / batch / stream", desc: "Uniform execution modes on any Runnable", code: "chain.invoke({...})\nchain.batch([...], config={'max_concurrency': 5})\nfor c in chain.stream({...}): print(c, end='')" },
        { term: "Async variants", desc: "Non-blocking execution for concurrent servers", code: "await chain.ainvoke({...})\nawait chain.abatch([...])\nasync for c in chain.astream({...}): ..." },
        { term: "RunnableParallel", desc: "Run several sub-chains concurrently, merge results", code: "from langchain_core.runnables import RunnableParallel\nRunnableParallel(summary=sum_chain, sentiment=sent_chain)" },
        { term: "RunnableLambda", desc: "Wrap plain Python logic as a first-class Runnable", code: "from langchain_core.runnables import RunnableLambda\ndouble = RunnableLambda(lambda x: x * 2)" },
        { term: "RunnablePassthrough", desc: "Forward input unchanged alongside other branches", code: "from langchain_core.runnables import RunnablePassthrough" },
      ],
    },
    {
      title: "Prompts, Parsing & Structured Output",
      color: "blue",
      rows: [
        { term: "Few-shot / partial variables", desc: "Reuse a template across related prompts", code: "prompt.partial(domain='billing')" },
        { term: "JsonOutputParser", desc: "Text-based JSON parsing (less reliable, legacy path)", code: "from langchain_core.output_parsers import JsonOutputParser" },
        { term: "with_structured_output", desc: "Preferred: bind a Pydantic schema to native tool-calling", code: "from pydantic import BaseModel\nclass R(BaseModel):\n    answer: str\nstructured = model.with_structured_output(R)" },
        { term: "Pydantic schema fields", desc: "Field descriptions guide the model's generation", code: "from pydantic import BaseModel, Field\nclass R(BaseModel):\n    eligible: bool = Field(description='...')" },
        { term: "Message roles", desc: "system / human / ai tuples in a chat prompt", code: "('system', '...'), ('human', '{q}'), ('ai', '...')" },
        { term: "to_messages()", desc: "Inspect the fully rendered prompt before it's sent", code: "prompt.invoke({...}).to_messages()" },
        { term: "bind_tools", desc: "Attach callable tool schemas to a model", code: "model_with_tools = model.bind_tools([my_tool])" },
      ],
    },
    {
      title: "Retrieval, RAG & Memory",
      color: "emerald",
      rows: [
        { term: "as_retriever()", desc: "Wrap a vector store as a retriever Runnable", code: "retriever = vectorstore.as_retriever(search_kwargs={'k': 4})" },
        { term: "RAG chain pattern", desc: "Retrieve context, pass question through, prompt, parse", code: "rag_chain = ({'context': retriever | format_docs,\n  'question': RunnablePassthrough()} | prompt | model\n  | StrOutputParser())" },
        { term: "format_docs helper", desc: "Join retrieved Document objects into prompt context", code: "def format_docs(docs):\n    return '\\n\\n'.join(d.page_content for d in docs)" },
        { term: "InMemoryChatMessageHistory", desc: "Simple per-session message store", code: "from langchain_core.chat_history import InMemoryChatMessageHistory" },
        { term: "RunnableWithMessageHistory", desc: "Inject prior turns into a chain automatically", code: "chain_with_history = RunnableWithMessageHistory(\n  prompt | model, get_history_fn,\n  input_messages_key='question', history_messages_key='history')" },
        { term: "session_id config", desc: "Key each conversation's history separately", code: "chain_with_history.invoke({'question': '...'},\n  config={'configurable': {'session_id': 'user-42'}})" },
        { term: "Windowing / summarizing memory", desc: "Bound unbounded history growth deliberately", code: "# keep last N turns, or periodically summarize\n# older turns into a compact running summary" },
      ],
    },
    {
      title: "Tools & Agents",
      color: "amber",
      rows: [
        { term: "@tool decorator", desc: "Turn a Python function into a callable tool", code: "from langchain_core.tools import tool\n@tool\ndef lookup(order_id: str) -> str:\n    'Look up an order's status by ID.'\n    return 'shipped'" },
        { term: "Tool docstring", desc: "The model reads this to decide when/how to call it", code: "# write it as carefully as a prompt — vague\n# docstrings produce unreliable tool selection" },
        { term: "response.tool_calls", desc: "Inspect what the model actually requested", code: "for call in response.tool_calls:\n    print(call['name'], call['args'])" },
        { term: "AgentExecutor", desc: "Simple fixed reasoning-and-acting loop", code: "# straightforward for a single-loop tool-calling agent;\n# awkward once branching/retries/approval steps appear" },
        { term: "Escalate to LangGraph", desc: "For cycles, branching, retries, human-in-the-loop", code: "# see the LangGraph skill — state graph with\n# nodes/edges instead of a fixed loop" },
        { term: "Agent loop mechanics", desc: "Model requests a call; your code executes it", code: "# the model NEVER executes anything itself —\n# app code runs the tool and feeds back the result" },
      ],
    },
    {
      title: "Resilience, Performance & Pitfalls",
      color: "rose",
      rows: [
        { term: "with_retry", desc: "Bounded retries on transient failures", code: "model.with_retry(stop_after_attempt=3)" },
        { term: "with_fallbacks", desc: "Fall through to a backup model on failure", code: "primary.with_fallbacks([backup_model])" },
        { term: "Always set timeouts", desc: "A hung call otherwise blocks a worker indefinitely", code: "ChatOpenAI(model='gpt-4o-mini', timeout=20, max_retries=2)" },
        { term: "Single-call anti-pattern", desc: "Don't wrap one stateless call in a full chain", code: "# for ONE non-reused call, just use the raw\n# provider SDK directly instead of LangChain" },
        { term: "Unbounded memory pitfall", desc: "Context window blown, cost grows with conversation length", code: "# window or summarize; never leave memory unbounded" },
        { term: "Version churn", desc: "Classes/imports have moved across releases — verify", code: "# pin exact langchain-core/langchain/community/\n# provider package versions in your lockfile" },
        { term: "Sequential calls add up", desc: "Each extra LLM call in a chain multiplies latency", code: "# consolidate steps, or parallelize independent\n# ones with RunnableParallel" },
        { term: "Retrieve-first debugging", desc: "Inspect retrieved context before blaming the model", code: "# most 'wrong answer' bugs are retrieval bugs,\n# not generation bugs" },
      ],
    },
    {
      title: "Production Toolbelt",
      color: "cyan",
      rows: [
        { term: "LangSmith tracing", desc: "Turn on full request/response tracing per chain step", code: "import os\nos.environ['LANGCHAIN_TRACING_V2'] = 'true'\nos.environ['LANGCHAIN_PROJECT'] = 'my-project'" },
        { term: "FakeListChatModel", desc: "Deterministic model for unit tests, no real API calls", code: "from langchain_core.language_models.fake_chat_models import FakeListChatModel\nFakeListChatModel(responses=['...'])" },
        { term: "Structured logging", desc: "Log inputs, outputs, and tool calls per request", code: "log.info('llm_call', input=q, tool_calls=response.tool_calls)" },
        { term: "Package layout", desc: "core (interfaces) / langchain (chains, agents) / community (integrations)", code: "langchain-core, langchain, langchain-community,\nlangchain-openai, langchain-anthropic, ..." },
        { term: "Secrets handling", desc: "API keys from env/secrets manager, never hardcoded", code: "os.environ['OPENAI_API_KEY']  # never literal in source" },
        { term: "Untrusted content", desc: "Treat retrieved/tool text as data, not instructions", code: "# reinforce system instruction boundaries;\n# never let retrieved text override them" },
        { term: "Rate limiting endpoints", desc: "Guard user-facing chains from cost/abuse", code: "# auth + rate limit every /chat, /query endpoint" },
        { term: "Deployment healthcheck", desc: "Verify dependencies (model API, vector store) reachable", code: "GET /healthz -> process alive\nGET /readyz  -> deps reachable" },
      ],
    },
  ],
};

export default langchain;
